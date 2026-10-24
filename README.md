# The Capital Real Estate

Responsive luxury-style static website starter. Separate from the existing SkyLuxe project.

## Files
- `index.html`: site sections, property cards, enquiry form
- `styles.css`: responsive black/gold/ivory design
- `script.js`: filters, mobile navigation, enquiry form and WhatsApp actions
- `config.js`: configure verified company contact details

## Before launch
1. Edit `config.js` and add the verified WhatsApp number (digits only, including country code) and enquiry email.
2. Test on mobile and desktop.
3. Replace sample listings with verified listings. Keep the DEMO LISTING labels until each property is confirmed.
4. The form opens a prepared email draft only when `contactEmail` is configured. Without it, it displays a copyable message; it does not send or store form details. For server-side email delivery, connect a backend and keep API keys server-side.
5. Property photos are remote illustrative images and require internet access.

## Preview
Open `index.html` in a browser, or use a local static server.

## Deploy
Deploy as a new static site/project. Do not overwrite the SkyLuxe Real Estate repository or service.


Latest interface update: removed the separate top search/filter bar. Buy/Rent and preferred Delhi-NCR location are now collected in the main enquiry form.
