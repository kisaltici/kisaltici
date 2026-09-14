export const DEFAULT_SHORTCUTS = {
  newLink: { key: 'k', ctrl: true, alt: false, shift: false },
  search: { key: '/', ctrl: true, alt: false, shift: false },
  toggleSidebar: { key: 'b', ctrl: true, alt: false, shift: false },
  close: { key: 'escape', ctrl: false, alt: false, shift: false },
};

export const isMac =
  typeof window !== 'undefined' &&
  navigator.platform &&
  navigator.platform.toUpperCase().indexOf('MAC') >= 0;

/**
 * Normalizes event.key for comparison
 */
export function normalizeKey(keyStr) {
  if (!keyStr) return '';
  const lower = keyStr.toLowerCase();
  if (lower === 'esc' || lower === 'escape') return 'escape';
  if (lower === ' ') return 'space';
  return lower;
}

/**
 * Checks if a keypress event matches a stored shortcut object
 */
export function matchShortcut(event, shortcutObj) {
  if (!event || !shortcutObj || !shortcutObj.key) return false;

  const eventKey = normalizeKey(event.key);
  const targetKey = normalizeKey(shortcutObj.key);

  if (eventKey !== targetKey) return false;

  const isCmdOrCtrl = event.metaKey || event.ctrlKey;
  const requiresCtrl = Boolean(shortcutObj.ctrl);

  if (requiresCtrl && !isCmdOrCtrl) return false;
  if (!requiresCtrl && isCmdOrCtrl && targetKey !== 'escape') return false;

  if (Boolean(shortcutObj.alt) !== Boolean(event.altKey)) return false;
  if (Boolean(shortcutObj.shift) !== Boolean(event.shiftKey)) return false;

  return true;
}

/**
 * Formats keycap label strings for rendering in keycap UI
 */
export function getKeycapLabels(shortcutObj) {
  if (!shortcutObj || !shortcutObj.key) return [];
  const labels = [];

  if (shortcutObj.ctrl) {
    labels.push(isMac ? '⌘' : 'Ctrl');
  }
  if (shortcutObj.alt) {
    labels.push(isMac ? '⌥' : 'Alt');
  }
  if (shortcutObj.shift) {
    labels.push('Shift');
  }

  const keyLower = normalizeKey(shortcutObj.key);
  if (keyLower === 'escape') {
    labels.push('Esc');
  } else if (keyLower === 'space') {
    labels.push('Space');
  } else {
    labels.push(shortcutObj.key.toUpperCase());
  }

  return labels;
}

/**
 * Checks if two shortcut objects are identical
 */
export function areShortcutsEqual(s1, s2) {
  if (!s1 || !s2) return false;
  return (
    normalizeKey(s1.key) === normalizeKey(s2.key) &&
    Boolean(s1.ctrl) === Boolean(s2.ctrl) &&
    Boolean(s1.alt) === Boolean(s2.alt) &&
    Boolean(s1.shift) === Boolean(s2.shift)
  );
}
