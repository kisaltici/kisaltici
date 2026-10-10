import express from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { isAdminUser } from '../utils/admin.js';
import { getLimits } from '../config/plans.js';
import { effectivePlanOf, subscriptionOf } from '../utils/plan.js';
import { getUsage, subjectFor } from '../utils/usage.js';

// Plan info sent with the profile. Admins are reported as plan 'admin' (derived at read time;
// the stored plan is untouched). limits/usage use null for unlimited.
const planInfo = async (req, userDoc) => {
  const plan = isAdminUser(req.user) ? 'admin' : effectivePlanOf(userDoc);
  return {
    membershipPlan: plan,
    limits: getLimits(plan),
    usage: await getUsage(subjectFor(req)),
    subscription: isAdminUser(req.user)
      ? { plan: 'admin', status: 'admin', period: null, expiresAt: null }
      : subscriptionOf(userDoc),
  };
};

const router = express.Router();

/**
 * Username validation helper: 3-20 chars, letters, numbers, underscore, no spaces
 */
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

// The reserved 'admin' username can only be held by UIDs listed in ADMIN_UIDS

/**
 * GET /api/user/profile
 * Returns authenticated user profile from MongoDB (creates default record if none exists).
 */
router.get('/profile', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.uid;
    let user = await User.findOne({ userId });

    if (!user) {
      const userData = {
        userId: userId,
        displayName: req.user.name || req.user.email || '',
        photoURL: req.user.picture || '',
        email: req.user.email || '',
        membershipPlan: 'free',
      };
      user = await User.create(userData);
    }

    if (user.username === 'admin' && isAdminUser(req.user) && user.membershipPlan !== 'pro') {
      user.membershipPlan = 'pro';
      await user.save();
    }

    return res.status(200).json({
      success: true,
      profile: {
        userId: user.userId,
        displayName: user.displayName || '',
        username: user.username || '',
        photoURL: user.photoURL || '',
        email: user.email || '',
        ...(await planInfo(req, user)),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/user/profile
 * Updates authenticated user's profile details (displayName, username, photoURL).
 * Enforces strict username format and database uniqueness.
 */
router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { displayName, username, photoURL } = req.body || {};

    const updateOps = {
      $set: {},
      $setOnInsert: {
        userId: userId,
        email: req.user.email || '',
      },
    };

    if (typeof displayName === 'string') {
      updateOps.$set.displayName = displayName.trim().slice(0, 100);
    }

    if (typeof photoURL === 'string') {
      updateOps.$set.photoURL = photoURL.trim().slice(0, 2048);
    }

    if (typeof username === 'string') {
      const trimmedUsername = username.trim().toLowerCase();

      if (trimmedUsername.length > 0) {
        if (!USERNAME_REGEX.test(trimmedUsername)) {
          return res.status(400).json({
            success: false,
            error: 'Kullanıcı adı geçersiz. (3-20 karakter, harf, rakam veya alt çizgi kullanın)',
          });
        }

        if (trimmedUsername === 'admin' && !isAdminUser(req.user)) {
          return res.status(400).json({
            success: false,
            error: 'Bu kullanıcı adı zaten kullanılıyor.',
          });
        }

        // Check uniqueness across other users
        const conflict = await User.findOne({
          username: trimmedUsername,
          userId: { $ne: userId },
        });

        if (conflict) {
          return res.status(400).json({
            success: false,
            error: 'Bu kullanıcı adı zaten kullanılıyor.',
          });
        }

        updateOps.$set.username = trimmedUsername;

        if (trimmedUsername === 'admin') {
          updateOps.$set.membershipPlan = 'pro';
        }
      } else {
        // Unset username field so MongoDB sparse index ignores it
        updateOps.$unset = { username: 1 };
      }
    }

    if (Object.keys(updateOps.$set).length === 0) {
      delete updateOps.$set;
    }

    const updatedUser = await User.findOneAndUpdate(
      { userId },
      updateOps,
      { new: true, upsert: true }
    );

    return res.status(200).json({
      success: true,
      profile: {
        userId: updatedUser.userId,
        displayName: updatedUser.displayName || '',
        username: updatedUser.username || '',
        photoURL: updatedUser.photoURL || '',
        email: updatedUser.email || '',
        ...(await planInfo(req, updatedUser)),
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Bu kullanıcı adı zaten kullanılıyor.',
      });
    }
    next(error);
  }
});

export default router;
