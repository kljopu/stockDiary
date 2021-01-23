import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { User } from "src/user/user.model";

export const ReqGql = createParamDecorator(
    (data: unknown, context: ExecutionContext): Request =>
        GqlExecutionContext.create(context).getContext().req,
);

export const ResGql = createParamDecorator(
    (data: unknown, context: ExecutionContext): Response =>
        GqlExecutionContext.create(context).getContext().res,
);

export const GqlUser = createParamDecorator(
    (data: unknown, context: ExecutionContext): User => {
        const ctx = GqlExecutionContext.create(context).getContext();
        return ctx.req && ctx.req.user;
    },
);