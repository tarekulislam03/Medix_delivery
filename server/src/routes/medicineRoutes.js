import express from 'express';
import Medicine from '../models/Medicine.js';

const router = express.Router();

/**
 * GET /api/medicines
 * Query params:
 *   q: search string (optional)
 *   category: filter by category (optional)
 *   popular: boolean (optional)
 *   limit: integer, default 50
 */
router.get('/', async (req, res) => {
  try {
    const { q, category, popular, limit = 50 } = req.query;
    const maxLimit = Math.min(parseInt(limit, 10) || 50, 200);

    const filter = {};

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (popular === 'true') {
      filter.popular = true;
    }

    if (q && q.trim()) {
      const trimmed = q.trim();
      const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // 1. First priority: items starting with query (prefix match)
      const prefixFilter = {
        ...filter,
        name: { $regex: `^${escaped}`, $options: 'i' },
      };

      const prefixResults = await Medicine.find(prefixFilter)
        .select('_id name slug price category strength popular requiresRx')
        .sort({ popular: -1, name: 1 })
        .limit(maxLimit)
        .lean();

      // 2. Second priority: items containing query if limit not reached
      let remainingLimit = maxLimit - prefixResults.length;
      let substringResults = [];

      if (remainingLimit > 0) {
        const prefixIds = prefixResults.map((r) => r._id);
        const substringFilter = {
          ...filter,
          name: { $regex: escaped, $options: 'i' },
          _id: { $nin: prefixIds },
        };

        substringResults = await Medicine.find(substringFilter)
          .select('_id name slug price category strength popular requiresRx')
          .sort({ popular: -1, name: 1 })
          .limit(remainingLimit)
          .lean();
      }

      const results = [...prefixResults, ...substringResults];
      res.setHeader('Cache-Control', 'public, max-age=30');
      return res.status(200).json(results);
    }

    // Default query without search string: return trending first, then popular
    const queryBuilder = Medicine.find(filter)
      .select('_id name slug price category strength popular trendingRank requiresRx')
      .sort({ trendingRank: 1, popular: -1, name: 1 })
      .limit(maxLimit)
      .lean();

    const medicines = await queryBuilder.exec();

    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.status(200).json(medicines);
  } catch (error) {
    console.error('Error fetching medicines:', error);
    return res.status(500).json({ error: 'Failed to fetch medicines' });
  }
});

/**
 * GET /api/medicines/categories
 * Returns all distinct categories and their counts
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Medicine.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).json(categories.map((c) => ({ name: c._id, count: c.count })));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
