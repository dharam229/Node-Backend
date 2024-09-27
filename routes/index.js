const routes = require('express').Router();
const { API_V } = process.env;

/*************User route**************/
const user_routes     = require('./UserRoute');
routes.all('/api/'+ API_V +'/users/*', user_routes);
routes.all('/api/'+ API_V +'/members/*', user_routes);

/*************Discussion route**************/
const discussion_routes = require('./DiscussionRoute');
routes.all('/api/'+ API_V +'/discussions/*', discussion_routes);

/*************Category route**************/
const category_routes = require('./CategoryRoute');
routes.all('/api/'+ API_V +'/categories/*', category_routes);

/*************Ads route**************/
const ads_routes = require('./AdvertisementRoute');
routes.all('/api/'+ API_V +'/advertisements/*', ads_routes);

/*************Coupon route**************/
const coupon_routes = require('./CouponRoute');
routes.all('/api/'+ API_V +'/coupons/*', coupon_routes);

/*************Ticket route**************/
const ticket_routes = require('./TicketRoute');
routes.all('/api/'+ API_V +'/ticket/*', ticket_routes);

/*************Plan route**************/
const plan_routes = require('./PlanRoute');
routes.all('/api/'+ API_V +'/plan/*', plan_routes);

/*************User Story route**************/
const user_story_routes = require('./UserStoryRoute');
routes.all('/api/'+ API_V +'/story/*', user_story_routes);

/*************Reports route**************/
const report_routes = require('./ReportRoute');
routes.all('/api/'+ API_V +'/report*', report_routes);

/*************Reports route**************/
const chat_routes = require('./ChatRoute');
routes.all('/api/'+ API_V +'/chat*', chat_routes);

/*************Plan route**************/
const subscription_routes = require('./SubscriptionRoute');
routes.all('/api/'+ API_V +'/subscription/*', subscription_routes);

/*************Country route**************/
const country_routes = require('./CountryRoute');
routes.all('/api/'+ API_V +'/country*', country_routes);

/************* Content route**************/
const ContentRoute = require('./ContentRoute');
routes.all('/api/'+ API_V +'/content*', ContentRoute);

/*************Notification route**************/
const notification_route = require('./NotificationRoute');
routes.all('/api/'+ API_V +'/notification*', notification_route);

/*************Webhook route**************/
const webhook_routes = require('./WebhookRoute');
routes.all('/api/'+ API_V +'/webhook/*', webhook_routes);



module.exports = routes;