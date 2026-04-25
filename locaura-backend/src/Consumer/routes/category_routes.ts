import { Router, Request, Response } from 'express';
import CategoryModel from '../../Retailer/models/Category.model';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        // Fetch top-level categories (those without a parent)
        const categories = await CategoryModel.find({ parent_id: { $exists: false } }).sort({ name: 1 });
        res.status(200).json({ success: true, count: categories.length, data: { categories } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to fetch categories' });
    }
});

router.get('/:id/subcategories', async (req: Request, res: Response) => {
    try {
        const parent_id = req.params.id;
        const categories = await CategoryModel.find({ parent_id }).sort({ name: 1 });
        res.status(200).json({ success: true, count: categories.length, data: { categories } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to fetch subcategories' });
    }
});

export default router;
