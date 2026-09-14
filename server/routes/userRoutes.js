import express from 'express';
import User from '../models/User.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Username validation helper: 3-20 chars, letters, numbers, underscore, no spaces
 */
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

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

    // Temporary test setup: Assign Pro plan if username is 'admin'
    if (user.username === 'admin' && user.membershipPlan !== 'pro') {
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
        membershipPlan: user.membershipPlan || 'free',
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
      updateOps.$set.displayName = displayName.trim();
    }

    if (typeof photoURL === 'string') {
      updateOps.$set.photoURL = photoURL.trim();
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

        // Temporary test setup: Assign Pro plan if username is set to 'admin'
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
        membershipPlan: updatedUser.membershipPlan || 'free',
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
