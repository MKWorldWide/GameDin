import { FastifyInstance } from 'fastify';
import { authenticate } from '../middleware/auth.middleware';
import { 
  createInvite, 
  listInvites, 
  getInvite, 
  deleteInvite, 
  validateInvite 
} from '../controllers/invite.controller';

const inviteRoutes = async (fastify: FastifyInstance) => {
  // Admin routes (require authentication and admin role)
  fastify.register(async (adminRoutes) => {
    // Apply authentication middleware to all admin routes
    adminRoutes.addHook('preHandler', authenticate(['admin']));
    
    /**
     * @swagger
     * /api/invites:
     *   post:
     *     summary: Create a new invite code
     *     tags: [Invites]
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               role:
     *                 type: string
     *                 enum: [player, creator, moderator, admin]
     *                 default: player
     *                 description: Role to assign to users who register with this invite
     *               maxUses:
     *                 type: integer
     *                 minimum: 1
     *                 maximum: 1000
     *                 default: 1
     *                 description: Maximum number of times this invite can be used
     *               expiresInDays:
     *                 type: integer
     *                 minimum: 1
     *                 default: 7
     *                 description: Number of days until the invite expires
     *     responses:
     *       201:
     *         description: Invite created successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 code:
     *                   type: string
     *                   example: "ABC123"
     *                 url:
     *                   type: string
     *                   example: "https://app.example.com/signup?invite=ABC123"
     *                 expiresAt:
     *                   type: string
     *                   format: date-time
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       403:
     *         $ref: '#/components/responses/Forbidden'
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    adminRoutes.post('/', createInvite);
    
    /**
     * @swagger
     * /api/invites:
     *   get:
     *     summary: List all invite codes (paginated)
     *     tags: [Invites]
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
     *         description: Search term to filter invite codes
     *       - in: query
     *         name: role
     *         schema:
     *           type: string
     *           enum: [player, creator, moderator, admin]
     *         description: Filter invites by role
     *       - in: query
     *         name: status
     *         schema:
     *           type: string
     *           enum: [active, used, expired]
     *         description: Filter invites by status
     *       - in: query
     *         name: sortBy
     *         schema:
     *           type: string
     *           enum: [newest, oldest, expiring]
     *           default: newest
     *         description: Sort order for results
     *     responses:
     *       200:
     *         description: List of invite codes
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 invites:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/Invite'
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
    adminRoutes.get('/', listInvites);
    
    /**
     * @swagger
     * /api/invites/{code}:
     *   get:
     *     summary: Get details of a specific invite code
     *     tags: [Invites]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: code
     *         required: true
     *         schema:
     *           type: string
     *         description: The invite code to retrieve
     *     responses:
     *       200:
     *         description: Invite code details
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 invite:
     *                   $ref: '#/components/schemas/Invite'
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       403:
     *         $ref: '#/components/responses/Forbidden'
     *       404:
     *         description: Invite not found
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    adminRoutes.get('/:code', getInvite);
    
    /**
     * @swagger
     * /api/invites/{code}:
     *   delete:
     *     summary: Delete an invite code
     *     tags: [Invites]
     *     security:
     *       - bearerAuth: []
     *     parameters:
     *       - in: path
     *         name: code
     *         required: true
     *         schema:
     *           type: string
     *         description: The invite code to delete
     *     responses:
     *       200:
     *         description: Invite deleted successfully
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
     *                   example: "Invite deleted successfully"
     *       401:
     *         $ref: '#/components/responses/Unauthorized'
     *       403:
     *         $ref: '#/components/responses/Forbidden'
     *       404:
     *         description: Invite not found
     *       500:
     *         $ref: '#/components/responses/ServerError'
     */
    adminRoutes.delete('/:code', deleteInvite);
  });
  
  // Public route for validating invite codes (no auth required)
  /**
   * @swagger
   * /api/invites/validate/{code}:
   *   get:
   *     summary: Validate an invite code
   *     tags: [Invites]
   *     parameters:
   *       - in: path
   *         name: code
   *         required: true
   *         schema:
   *           type: string
   *         description: The invite code to validate
   *     responses:
   *       200:
   *         description: Invite is valid
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 valid:
   *                   type: boolean
   *                   example: true
   *                 role:
   *                   type: string
   *                   example: "player"
   *                 createdBy:
   *                   type: string
   *                   format: uuid
   *                   example: "123e4567-e89b-12d3-a456-426614174000"
   *                 expiresAt:
   *                   type: string
   *                   format: date-time
   *       400:
   *         description: Invalid or expired invite code
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 valid:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "This invite code has expired"
   *       404:
   *         description: Invite not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 valid:
   *                   type: boolean
   *                   example: false
   *                 error:
   *                   type: string
   *                   example: "Invalid or expired invite code"
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  fastify.get('/validate/:code', validateInvite);
  
  return fastify;
};

export default inviteRoutes;
