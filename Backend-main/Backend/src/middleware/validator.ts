import { body, ValidationChain } from 'express-validator';

export const validateFaculty: ValidationChain[] = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('designation').trim().notEmpty().withMessage('Designation is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('phone').optional().trim(),
    body('image').optional().trim(),
    body('education').optional().isArray().withMessage('Education must be an array'),
    body('research').optional().isArray().withMessage('Research must be an array'),
    body('publications').optional().isArray().withMessage('Publications must be an array'),
];

export const validateCourse: ValidationChain[] = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('code').trim().notEmpty().withMessage('Course code is required'),
    body('level')
        .isIn(['Undergraduate', 'M.Sc.', 'Ph.D.'])
        .withMessage('Level must be Undergraduate, M.Sc., or Ph.D.'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('credits').optional().isInt({ min: 0, max: 10 }).withMessage('Credits must be between 0 and 10'),
];

export const validateNews: ValidationChain[] = [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('excerpt').trim().notEmpty().withMessage('Excerpt is required'),
    body('image').trim().notEmpty().withMessage('Image is required'),
    body('url').optional().trim(),
    body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
    body('order').optional().isInt().withMessage('Order must be an integer'),
];

export const validateContact: ValidationChain[] = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('subject').trim().notEmpty().withMessage('Subject is required'),
    body('message').trim().notEmpty().withMessage('Message is required'),
];

export const validateRegister: ValidationChain[] = [
    body('username')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 characters'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
    body('role')
        .optional()
        .isIn(['admin', 'superadmin'])
        .withMessage('Role must be admin or superadmin'),
];

export const validateLogin: ValidationChain[] = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
];
