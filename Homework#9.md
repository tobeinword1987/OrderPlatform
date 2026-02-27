
# Users domain was integrated

User can:
- upload file to the AWS3 storage with presigned url (@Get('presigned')).
  It will generate uploadUrl, which you then can use to upload file to the storage with necessary permissions;
- check, that file exists in storage and set file status to "ready" 
  (@Post('complete'));
- set one of uploaded files as his avatar (@Post('avatar')).

# Permissions (auth module)

On every controller method I can add decorator Roles([]) with the allowed roles for this operation. User's role will be checked according to what roles user has and what roles are allowed to execute request (jwt-auth.guard.ts). Every role can has many scopes. And the DB structure has already existed.But I didn't use scopes in this app, just RBAC.

Also main jwt-strategy is set to validate each request after user has logged in. 

There are 2 endpoints which allow you to aithorize and then to exchange access token with refresh token, if the first one will expired:

-   @Post('auth/login');
-   @Post('auth/refresh')

# Public url for review

It is generated in S3Service as string which contains from:

 - `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`

 or

 - `${endpoint}/${this.bucket}/${key}`
