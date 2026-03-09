
# Users domain was integrated

User can:
- upload file to the AWS3 storage with presigned url (@Post('presigne')).
  It will generate uploadUrl, which you then can use to upload file to the storage with necessary permissions;
- check, that file exists in storage and set file status to "ready" 
  (@Post('complete'));
- set one of uploaded files as his avatar (@Post('avatar')).

# Permissions (auth module)

On every controller method I can add decorator Roles([]) with the allowed roles for this operation. User's role will be checked according to what roles user has and what roles are allowed to execute request (jwt-auth.guard.ts). Every role can has many scopes. And the DB structure has already existed. But I didn't use scopes in this app, just RBAC.

Also main jwt-strategy is set to validate each request after user has logged in. 

There are 2 endpoints which allow you to aithorize and then to exchange access token with refresh token, if the first one will expired:

-   @Post('auth/login');
-   @Post('auth/refresh')

# Public url for review

It is generated in S3Service as string which contains from:

 - `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`

 or

 - `${endpoint}/${this.bucket}/${key}`

 # Integration is with entity User and entity Files. This entity has avatarId.

  @Column({ type: 'uuid', name: 'avatar_id', nullable: true })
  avatarId: UUID;

  @OneToOne(
    () => UploadFile,
    file => file.user,
    { nullable: true })
  @JoinColumn({ name: 'avatar_id' })
  avatar?: UploadFile;

  @OneToMany(() => UploadFile, (file) => file.user, { nullable: true })
  files?: UploadFile[];


  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  One user can create many files and can set one of his own files as his avatar. There is an integration between User and Files entities. Look at fields:  
  Files entity: userId, user
  User entity: avatarId, files

# Set avatar endpoint
  
   About your previous comment: У complete додати доменний attach (або чітко перебудувати flow так, щоб complete виконував вимогу statement щодо привʼязки).

    I have separate endpoint where I do connection between Users and Files. It is in Users domain:
    @Post('users/avatar')

# Use compose.dev.yml for testing, set necessary envs in .env file.
