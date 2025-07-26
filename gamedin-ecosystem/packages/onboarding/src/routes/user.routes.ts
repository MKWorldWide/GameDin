import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth.middleware';
import { 
  listUsers, 
  getUser, 
  updateUser, 
  deleteUser 
} from '../controllers/user.controller';

const userRoutes = async (fastify: FastifyInstance) => {
  // Apply authentication middleware to all user routes
  fastify.addHook('preHandler', authenticate());
  
  /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: List all users (paginated)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *           default: 1
   *         description: Page number for pagination
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 10
   *         description: Number of items per page
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Search term to filter users by email, username, or display name
   *       - in: query
   *         name: role
   *         schema:
   *           type: string
   *           enum: [player, creator, moderator, admin]
   *         description: Filter users by role
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [active, suspended, unverified]
   *         description: Filter users by status
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [newest, oldest, name]
   *           default: newest
   *         description: Sort order for results
   *     responses:
   *       200:
   *         description: List of users
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 users:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/User'
   *                 total:
   *                   type: integer
   *                   example: 42
   *                 page:
   *                   type: integer
   *                   example: 1
   *                 pageSize:
   *                   type: integer
   *                   example: 10
   *                 totalPages:
   *                   type: integer
   *                   example: 5
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  fastify.get('/', { preHandler: authenticate(['admin']) }, listUsers);
  
  /**
   * @swagger
   * /api/users/{id}:
   *   get:
   *     summary: Get user by ID
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     responses:
   *       200:
   *         description: User details
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: User not found
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  fastify.get('/:id', getUser);
  
  /**
   * @swagger
   * /api/users/{id}:
   *   put:
   *     summary: Update user
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *                 format: email
   *                 description: New email address (must be unique)
   *               username:
   *                 type: string
   *                 minLength: 3
   *                 maxLength: 50
   *                 description: New username (must be unique)
   *               displayName:
   *                 type: string
   *                 maxLength: 100
   *                 description: New display name
   *               avatar:
   *                 type: string
   *                 format: uri
   *                 description: URL to user's avatar image
   *               bio:
   *                 type: string
   *                 maxLength: 500
   *                 description: User biography
   *               roles:
   *                 type: array
   *                 items:
   *                   type: string
   *                   enum: [player, creator, moderator, admin]
   *                 description: User roles (admin only)
   *               isEmailVerified:
   *                 type: boolean
   *                 description: Email verification status (admin only)
   *               isSuspended:
   *                 type: boolean
   *                 description: Account suspension status (admin only)
   *               suspendReason:
   *                 type: string
   *                 maxLength: 500
   *                 description: Reason for suspension (required when suspending, admin only)
   *     responses:
   *       200:
   *         description: User updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 user:
   *                   $ref: '#/components/schemas/User'
   *       400:
   *         description: Invalid input
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "Cannot remove admin role from yourself"
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: User not found
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  fastify.put('/:id', updateUser);
  
  /**
   * @swagger
   * /api/users/{id}:
   *   delete:
   *     summary: Delete user (admin only)
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: User ID to delete
   *     responses:
   *       200:
   *         description: User deleted successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "User deleted successfully"
   *       400:
   *         description: Cannot delete own account
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 error:
   *                   type: string
   *                   example: "You cannot delete your own account"
   *       401:
   *         $ref: '#/components/responses/Unauthorized'
   *       403:
   *         $ref: '#/components/responses/Forbidden'
   *       404:
   *         description: User not found
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  fastify.delete('/:id', { preHandler: authenticate(['admin']) }, deleteUser);
  
  return fastify;
};

export default userRoutes;
