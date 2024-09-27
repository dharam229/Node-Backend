const nodemailer = require("nodemailer");
const config = require('../config');
const models = require('../models');
const Setting = models.Setting;
const moment = require('moment');

var transporter = nodemailer.createTransport({
  host: config.host,
  port: config.port,
  service: config.service,
  auth: {
    user: config.username,
    pass: config.password
  },
});

module.exports = {

  staffCreated: async function (email, subject, data) {
    const mail = { from: config.fromemail, to: email, subject: subject,  html: `<h1> Hello ` + data.firstname + ` please check your reset password link <a href="`+data.link+`">Link</a></h1>` }
    transporter.sendMail(mail, (err, data) => {
      if (err) {
        //console.log(err)
      } else {
        //console.log('email for staff sent',mail)
      }
    })
  },

  forgetPasswordEmail: async function (email, subject, data) {
    const mail = {
      from: config.fromemail,
      to: email,
      subject: subject,
      html: `<h1>` + data.link + `</h1>`
    }

    transporter.sendMail(mail, (err, data) => {
      if (err) {
        //console.log(err)
      } else {
        //console.log(mail)
      }
    })
  },
  sendEmailByHtmlTemplate: async function (email, subject, data) {
    const mail = {
      from: config.fromemail,
      to: email,
      subject: subject,
      html: ''
    }

    transporter.sendMail(mail, (err, data) => {
      if (err) {
        //console.log(err)
      } else {
        //console.log(mail)
      }
    })
  },
  ticketActionEmail: async function (email, subject, data, ticket_data) {
    const mail = {
      from: config.fromemail,
      to: email,
      subject: subject,
      html: `<h1>Hello ` + data.firstname + ` ` + data.lastname + ` your ticket was resolved.</h1>`
    }

    transporter.sendMail(mail, (err, data) => {
      if (err) {
        console.log(err)
      } else {
        console.log(mail)
      }
    })
  },

  //Send Email Regarding Subscription Cancel And Resume
  sendSubscriptionCancelResumeEmail: async function (email, subject, data) {
    const mail = {
      from: config.fromemail,
      to: email,
      subject: subject,
      html: `<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml"
        xmlns:o="urn:schemas-microsoft-com:office:office">
      
      <head>
        <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="date=no" />
        <meta name="format-detection" content="address=no" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="x-apple-disable-message-reformatting" />
      
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;700&display=swap" rel="stylesheet">
      
        <title>Mango</title>
        <style type="text/css" media="screen">
          /* Linked Styles */
          body {
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
            min-width: 100% !important;
            width: 100% !important;
            background: #1d1d1d;
            -webkit-text-size-adjust: none
          }
      
          a {
            color: #ffffff;
            text-decoration: none
          }
      
          p {
            padding: 0 !important;
            margin: 0 !important
          }
      
          img {
            -ms-interpolation-mode: bicubic;
            /* Allow smoother rendering of resized image in Internet Explorer */
          }
      
          .mcnPreviewText {
            display: none !important;
          }
      
          /* Mobile styles */
          @media only screen and (max-device-width: 480px),
          only screen and (max-width: 480px) {
            .mobile-shell {
              width: 100% !important;
              min-width: 100% !important;
            }
      
            .m-center {
              text-align: center !important;
            }
      
            .center {
              margin: 0 auto !important;
            }
      
            .td {
              width: 100% !important;
              min-width: 100% !important;
            }
      
            .m-br-15 {
              height: 15px !important;
            }
      
            .m-td,
            .m-hide {
              display: none !important;
              width: 0 !important;
              height: 0 !important;
              font-size: 0 !important;
              line-height: 0 !important;
              min-height: 0 !important;
            }
      
            .m-block {
              display: block !important;
            }
      
            .m-auto {
              height: auto !important;
            }
      
            .fluid-img img {
              width: 100% !important;
              max-width: 100% !important;
              height: auto !important;
            }
      
            .bg {
              -webkit-background-size: cover !important;
              background-size: cover !important;
              background-repeat: none !important;
              background-position: center 0 !important;
            }
      
            .p20-15 {
              padding: 20px 15px !important;
            }
      
            .p30-15 {
              padding: 30px 15px !important;
            }
      
            .p30-15-0 {
              padding: 30px 15px 0px 15px !important;
            }
      
            .pb-30 {
              padding-bottom: 30px !important;
            }
      
            .pb-30-0 {
              padding: 30px 0px !important;
            }
      
            .nopt {
              padding-top: 0px !important;
            }
      
            .nobb {
              border-bottom: none !important;
            }
      
            .nop {
              padding: 0 !important;
            }
      
            .content {
              padding: 30px 15px !important;
            }
      
            .bt150 {
              border-top: 30px solid #ffffff !important;
            }
      
            .entry {
              padding-bottom: 30px !important;
            }
      
            .pb60m {
              padding-bottom: 0px !important;
            }
      
            .separator {
              padding-top: 30px !important;
            }
      
            .box {
              padding: 30px 15px !important;
            }
      
            .box2 {
              padding: 30px 15px !important;
            }
      
            .pb60 {
              padding-bottom: 30px !important;
            }
      
            .h2 {
              font-size: 44px !important;
              line-height: 48px !important;
            }
      
            .title {
              font-size: 24px !important;
              line-height: 28px !important;
            }
      
            .m-list {
              font-size: 18px !important;
              line-height: 22px !important;
            }
      
            .text-footer {
              text-align: center !important;
            }
      
            .column,
            .column-top,
            .column-dir,
            .column-empty,
            .column-empty2,
            .column-bottom,
            .column-dir-top,
            .column-dir-bottom {
              float: left !important;
              width: 100% !important;
              display: block !important;
            }
      
            .column-empty {
              padding-bottom: 10px !important;
            }
      
            .column-empty2 {
              padding-bottom: 30px !important;
            }
      
          }
        </style>
      </head>
      
      <body class="body"
        style="padding:0 !important; margin:0 !important; display:block !important; min-width:100% !important; width:100% !important; background:#1d1d1d; -webkit-text-size-adjust:none;">
        <!--*|IF:MC_PREVIEW_TEXT|*-->
        <!--[if !gte mso 9]><!-->
        <span class="mcnPreviewText"
          style="display:none; font-size:0px; line-height:0px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; visibility:hidden; mso-hide:all;">*|MC_PREVIEW_TEXT|*</span>
        <!--<![endif]-->
        <!--*|END:IF|*-->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#fff">
          <tr>
            <td align="center" valign="top">
              <!-- Header -->
      
              <!-- Logo + Socials Icons -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding: 30px 0px;" class="p30-15">
                    <table width="650" border="0" cellspacing="0" cellpadding="0" class="mobile-shell">
                      <tr>
                        <td class="td"
                          style="width:650px; min-width:650px; font-size:0pt; line-height:0pt; padding:0; margin:0; font-weight:normal; text-align: center;">
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <th class="column" width="140"
                                style="font-size:0pt; line-height:0pt; padding:0; margin:0; font-weight:normal;">
                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                  <tr>
                                    <!-- Logo -->
                                    <td class="img m-center"
                                      style="font-size:0pt; line-height:0pt; text-align:center;">
                                    </td>
                                    <!-- END Logo -->
                                  </tr>
                                </table>
                              </th>
                              </th>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- Logo + Socials Icons -->
              <!-- END Header -->
      
              <!-- Intro -->
              <div mc:repeatable="Select" mc:variant="Intro">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center">
                      <table width="600" border="0" cellspacing="0" cellpadding="0" class="mobile-shell"
                        style="box-shadow: 0px 0px 35px rgb(228 237 249);">
                        <tr>
                          <td class="td"
                            style="width:600px; min-width:600px; font-size:0pt; line-height:0pt; padding:0; margin:0; font-weight:normal;">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="">
                              <tr>
                                <td style="background:url(${data.url}/free_bg.jpg); background-repeat:no-repeat; background-size:cover;"
                                   valign="top" class="bg">
                                  <!--[if gte mso 9]>
                                  <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:650px; height: 420px">
                                    <v:fill type="frame" src="images/free_bg.jpg" color="#a3854b" />
                                    <v:textbox inset="0,0,0,0">
                                  <![endif]-->
                                  <div>
                                    <table width="100%" border="0" cellspacing="0"
                                      cellpadding="0">
                                      <tr>
                                        <td class="content-spacing" width="0"
                                          style="font-size:0pt; line-height:0pt; text-align:left;">
                                        </td>
                                        <td style="padding:0px;" class="">
                                          <table width="100%" border="0" cellspacing="0"
                                            cellpadding="0"
                                            style="box-shadow: 0px 0px 35px rgb(228 237 249);">
                                            <tr>
                                              <td class="box1" bgcolor="#ffffff"
                                                align="center"
                                                style="padding:30px 30px 15px 30px;">
                                                <table border="0" cellspacing="0"
                                                  cellpadding="0">
                                                  <tr>
                                                    <td class="h5-2 center pb20"
                                                      style="color:#000000; font-family: 'Montserrat', sans-serif;; font-size:26px; line-height:30px; text-transform:uppercase; text-align:center; padding-bottom:30px;">
                                                      <div mc:edit="text_4">
                                                      
                                                        <img src="${data.url}/logo.png"
                                                          mc:edit="image_4"
                                                          style=""
                                                          border="0"
                                                          alt="" />
                                                      </div>
                                                    </td>
                                                  </tr>
      
                                                  <tr>
                                                    <td class="text4 center pb30"
                                                      style="padding:45px 45px; background-color:#f6fafe; color:#000; font-family: 'Montserrat', sans-serif;; font-size:14px; line-height:20px; text-align:left; padding-bottom:30px;">
                                                      <div mc:edit="text_6"
                                                        style="margin-bottom:15px;">
                                                        <b
                                                          style="font-size:20px; text-transform: capitalize;">Hello
                                                          ${data.firstname + ' ' + data.lastname}</b>
                                                      </div>
                                                      <div mc:edit="text_6"
                                                        style="margin-bottom:15px;">
                                                       <p>${data.message}</p>
                                                      </div>
                                                    </td>
                                                  </tr>
                                                  <!-- Button -->
                                                  <!-- END Button -->
                                                </table>
                                              </td>
                                            </tr>
                                            <tr>
                                              <td
                                                style="padding:0px 30px 20px 30px; background-color:#fff;">
                                                <table width="100%" border="0"
                                                  cellspacing="0" cellpadding="0">
                                                  <tr>
                                                <td
                                                    style="padding:0px 30px 20px 30px; background-color:#fff;">
                                                    <table width="100%" border="0"
                                                    cellspacing="0" cellpadding="0">
                                                    <tr>
                                                        <td align="right"
                                                        style="background:#fff; text-align:center;">
                                                        <table class="center"
                                                            border="0"
                                                            cellspacing="0"
                                                            cellpadding="0"
                                                            style="text-align:center; width:100%;">
                                                            <tr>
                                                            <td class="img"
                                                                style="line-height:0pt;">
        
                                                                <a href="${data.facebook}"
                                                                target="_blank"
                                                                style="margin-left:5px !important; margin-right:5px !important;  padding: 4px; box-sizing: border-box;"><img
                                                                    src="${data.url}/ico_grey_facebook.png"
                                                                    width="25"
                                                                    height="25"
                                                                    mc:edit="image_5"
                                                                    style="max-width:100%; padding: 0px; margin: 0 auto; "
                                                                    border="0"
                                                                    alt="" /></a>
        
                                                                <a href="${data.twitter}"
                                                                target="_blank"
                                                                style="margin-left:5px !important; margin-right:5px !important;  padding: 4px; box-sizing: border-box;"><img
                                                                    src="${data.url}/ico_grey_twitter.png"
                                                                    width="25"
                                                                    height="25"
                                                                    mc:edit="image_6"
                                                                    style="max-width:100%; padding: 0px; margin: 0 auto; "
                                                                    border="0"
                                                                    alt="" /></a>
        
                                                                <a href="${data.instagram}"
                                                                target="_blank"
                                                                style="margin-left:5px !important; margin-right:5px !important;  padding: 4px; box-sizing: border-box;"><img
                                                                    src="${data.url}/ico_grey_instagram.png"
                                                                    width="25"
                                                                    height="25"
                                                                    mc:edit="image_8"
                                                                    style="max-width:100%; padding: 0px; margin: 0 auto; "
                                                                    border="0"
                                                                    alt="" /></a>
        
                                                                <a href="${data.pinterest}"
                                                                target="_blank"
                                                                style="margin-left:5px !important; margin-right:5px !important;  padding: 4px; box-sizing: border-box;"><img
                                                                    src="${data.url}/ico_grey_pinterest.png"
                                                                    width="25"
                                                                    height="25"
                                                                    mc:edit="image_9"
                                                                    style="max-width:100%; padding: 0px; margin: 0 auto; "
                                                                    border="0"
                                                                    alt="" /></a>
                                                            </td>
        
                                                            </tr>
                                                      </table>
                                                    </td>
                                                  </tr>
                                                </table>
      
                                              </td>
                                            </tr>
      
                                          </table>
                                        </td>
                                        <td class="content-spacing" width="0"
                                          style="font-size:0pt; line-height:0pt; text-align:left;">
                                        </td>
                                      </tr>
                                    </table>
                                  </div>
                                  <!--[if gte mso 9]>
                                    </v:textbox>
                                    </v:rect>
                                  <![endif]-->
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
      
                        <tr style="margin-bottom:30px;">
      
                          <td style="background-color:#ea0000; padding-top:5px; padding-bottom:5px;">
                            <table style="width:100%;">
                              <tr>
                                <td style="text-align:center;"><a
                                    style="padding-left:15px; font-family: 'Montserrat', sans-serif; font-size:14px; color: #fff;"
                                    href="mailto:Support@Mango.com"><img
                                      style="display: inline-block; vertical-align: middle;"
                                      src="${data.url}/mail-icon.png" alt="Email" />
                                    Support@Mango.com</a></td>
                              </tr>
                            </table>
      
                          </td>
      
                        </tr>
      
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
              <!-- END Intro -->
      
      
      
              <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#1d1d1d"
                style="margin-top:30px;">
                <tr>
                  <td class="text-footer p30-15"
                    style="padding: 28px 10px 50px; color:#7e7e7e; font-family: 'Montserrat', sans-serif; font-size:12px; line-height:20px; text-align:center;">
                    <div mc:edit="text_33">Want to change how you receive these emails?<br />You can <a
                        class="link-grey-u" target="_blank" href="*|UPDATE_PROFILE|*"
                        style="color:#7e7e7e; text-decoration:underline;">update your preferences</a> or <a
                        class="link-grey-u" target="_blank" href="*|UNSUB|*"
                        style="color:#7e7e7e; text-decoration:underline;">unsubscribe</a> from this list
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="img" style="font-size:0pt; line-height:0pt; text-align:left;">
                    <div mc:edit="text_34">
                      <!--[if !mso]><!-->
                      *|LIST:DESCRIPTION|*
                      *|LIST:ADDRESS|*
                      *|REWARDS_TEXT|*
                      <!--<![endif]-->
                    </div>
                  </td>
                </tr>
              </table>
              <!-- END Footer -->
            </td>
          </tr>
        </table>
      </body>
      
      </html>`
    }
    transporter.sendMail(mail, (err, data) => {
      if (err) {
        ///console.log('error during send email',err)
      } else {
        //console.log('mail sendt',mail)
      }
    })
  }

}