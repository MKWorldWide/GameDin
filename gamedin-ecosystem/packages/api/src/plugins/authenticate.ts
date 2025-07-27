import { FastifyReply, FastifyRequest } from 'fastify';

export async function verifyJWT(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({
      success: false,
      message: 'Unauthorized: Invalid or missing token',
    });
  }
}

export default async function authenticate(fastify: any) {
  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    return verifyJWT(request, reply);
  });
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
