# API LIST USED

- authRouter
post/signup
post/login
post/logout

- connectionRequestRouter
post/request/send/interested/:userId
post/request/send/ignored/:userId
post/request/send/review/accepted/:requestId
post/request/send/review/rejected/:requestId

- profileRouter
get/profile/view
patch/profile/passworf/edit
patch/profile/edit

- userRouter
get/user/connections
get/user/requests/recieved
get/user/feed - gets you the profiles of other user on platform

status: ignore,interested,accepted,rejected