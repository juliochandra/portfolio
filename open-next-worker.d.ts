declare module "*.open-next/worker.js" {
	const handler: {
		fetch(request: Request, environment: Env, executionContext: ExecutionContext): Response | Promise<Response>;
	};

	export default handler;
}
