const bcrypt           = require('bcryptjs');
const prisma           = require('../lib/prisma');

// GET /api/auth/me — get current user profile
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('[getMe error]', err.message);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

// PUT /api/auth/me — update profile (name or password)
const updateMe = async (req, res) => {
  const { name, currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const updateData = {};

    if (name) updateData.name = name;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new password' });
      }
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    const updated = await prisma.user.update({
      where:  { id: req.userId },
      data:   updateData,
      select: { id: true, name: true, email: true, createdAt: true },
    });

    res.json(updated);
  } catch (err) {
    console.error('[updateMe error]', err.message);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

module.exports = { getMe, updateMe };
