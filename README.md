# Who2Industries – Stay private. Stay root.

**Homepage of Who2Industries** – a coming‑soon landing page that showcases the future launch (01‑01‑2027) of a privacy‑first IT services hub.

## Description
A simple countdown site that will later host a suite of FOSS‑based services, including:

- Implementation of open‑source products  
- Server & client automation (Ansible, Bash, Docker/Podman)  
- Secure consulting for self‑hosted infrastructures  

The current page displays a timer and links to our social profiles.

## Features
- Live countdown to the official launch date (01‑01‑2027)  
- Footer with social media icons/links  
- Minimal, responsive design served over HTTP/HTTPS  

## Installation / Deployment
Deploy the static files on any standard web server (nginx, Apache, Caddy, etc.) with TLS enabled.

```bash
# Example with nginx
server {
    listen 80;
    listen 443 ssl;
    server_name who2industries.systems;

    root /var/www/who2industries;
    index index.html;
}

Usage

The site is intended solely for Who2Industries business purposes. Visitors can view the countdown and follow the provided social links.
Contributing

Contributions are welcome! Feel free to:

    Add new features or improve existing code
    Optimize assets (CSS, JS, images)

All contributors will be acknowledged on our social channels.
License

This project is licensed under the Apache License 2.0.

SPDX-License-Identifier: Apache-2.0

For the full license text, see the LICENSE file in the repository.

Built with privacy and openness in mind.
