import { defineEventHandler } from 'h3';
import { getUser } from '../../core/auth';

export default defineEventHandler(async (event) => {
    return await getUser(event);
});
