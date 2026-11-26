import * as service from '../service/request-service.js';
export const create = async (req, res, next) => { try { res.status(201).json({ request: await service.create(req.body, req.auth.user) }); } catch (e) { next(e); } };
export const list = async (req, res, next) => { try { res.json({ requests: await service.list(req.auth.user) }); } catch (e) { next(e); } };
export const decisions = async (req, res, next) => { try { res.json({ decisions: await service.listDecisions(req.auth.user) }); } catch (e) { next(e); } };
export const get = async (req, res, next) => { try { res.json({ request: await service.get(req.params.id, req.auth.user) }); } catch (e) { next(e); } };
export const history = async (req, res, next) => { try { res.json({ events: await service.getHistory(req.params.id, req.auth.user) }); } catch (e) { next(e); } };
export const submit = async (req, res, next) => { try { res.json({ request: await service.submit(req.params.id, req.auth.user) }); } catch (e) { next(e); } };
export const approve = async (req, res, next) => { try { res.json({ request: await service.approve(req.params.id, req.body, req.auth.user) }); } catch (e) { next(e); } };
export const reject = async (req, res, next) => { try { res.json({ request: await service.reject(req.params.id, req.body, req.auth.user) }); } catch (e) { next(e); } };
