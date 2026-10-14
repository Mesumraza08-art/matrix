MATRIX HOMES WEBSITE
====================

Static HTML/CSS/JS site with one PHP file (lead.php) that emails form
inquiries. Built for Hostinger shared hosting (any Apache + PHP host works).

DEPLOY ON HOSTINGER (Git, recommended)
1. hPanel > Websites > Manage > Advanced > Git.
2. Repository: https://github.com/Mesumraza08-art/matrix.git
   Branch: main   Directory: leave empty (deploys into public_html).
   public_html must be empty before the first deploy.
3. Click Create, then Deploy. Turn on Auto Deployment and add the webhook
   URL to GitHub (repo Settings > Webhooks) so every push redeploys.
4. hPanel > Security > SSL: install the free SSL certificate.
   .htaccess forces HTTPS and removes "www".

DEPLOY ON HOSTINGER (manual upload)
Upload every file and folder here (including the hidden .htaccess) to
public_html with File Manager or FTP. index.html is the homepage.

FORMS
Quote, contact and chat inquiries POST to lead.php, which emails them
(with photo/PDF attachments) to matrixhomes@live.com. Change LEAD_TO at
the top of lead.php to send them elsewhere.
For reliable delivery, create a mailbox such as no-reply@matrixhomes.ca in
hPanel > Emails; lead.php sends From: no-reply@<your domain>.
Test once after deploying by sending yourself a quote request.

WHAT TO CHANGE LATER
- Business details, services and text live in the source project
  (src/content.mjs). Ask for the source if you need to edit and rebuild.
- Project pages say "Coming soon" until real photos are supplied.
