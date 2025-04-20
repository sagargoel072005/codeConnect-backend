# API LIST USED

# authRouter
post/signup
post/login
post/logout

# profileRouter
get/profile/view
patch/profile/edit
patch/profile/edit/password

# connectionRequestRouter
post/request/send/interested/:userId
post/request/send/ignored/:userId
post/request/send/review/accepted/:requestId
post/request/send/review/rejected/:requestId

# userRouter
get/user/connections
get/user/requests/recieved
get/user/feed - gets you the profiles of other user on platform

status: ignore,interested,accepted,rejected