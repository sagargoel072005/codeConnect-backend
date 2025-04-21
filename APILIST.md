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
post/request/send/:status/:userId : interested / ignored

post/request/send/review/:status/:requestId : accepted / rejected

# userRouter
get/user/connections
get/user/requests/recieved
get/user/feed - gets you the profiles of other user on platform

status: ignore,interested,accepted,rejected