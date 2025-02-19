import Fastify from "fastify"
import fastifyBasicAuth from "@fastify/basic-auth"
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const port = 3000;
const authenticate = {realm: 'Westeros'}
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify({
    logger: true,
    http2: true,
    https: {
        key: await readFile(join(__dirname, "server.key")),
        cert: await readFile(join(__dirname, "server.crt")),
    },
})

fastify.register(fastifyBasicAuth, {
    validate,
    authenticate
})

async function validate(username, password, req, reply) {
    if (username !== 'Tyrion' || password !== 'wine') {
        return new Error('Winter is coming')
    }
}

fastify.get('/dmz', {}, (req, res) => {
    res.send({replique: "Ca pourrait être mieux protégé..."})
})

fastify.after(() => {
    fastify.route({
        method: 'GET',
        url: '/secu',
        onRequest: fastify.basicAuth,
        handler: async (req, reply) => {
            return {
                replique: 'Un Lannister paye toujours ses dettes !'
            }
        }
    })
})

fastify.after(() => {
    fastify.route({
        method: 'GET',
        url: '/autre',
        handler: async (req, reply) => {
            return {
                replique: 'Et oui Jamy !'
            }
        }
    })
})

fastify.setErrorHandler(function (err, req, reply) {

    if (err.statusCode === 401) {
        console.log(err)
        reply.code(401).send({replique: 'Tu ne sais rien, John Snow..'})
    }
    reply.send(err)
})

fastify.listen({port}, function (err, address) {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }

    fastify.log.info(`Fastify is listening on port: ${address}`);
});
