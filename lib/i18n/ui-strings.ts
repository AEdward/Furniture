// Every fixed (non-admin-editable) English string shown on the
// storefront, used as the translation source AND as the dictionary key
// (so components just call t("Add to cart") rather than maintaining a
// separate key namespace). Keep this deduplicated — getDictionary()
// translates the whole list in one batched API call per language, and
// every entry here is one row in the `translations` cache table.
//
// Strings with a runtime value use {placeholder} tokens, filled in by
// lib/i18n/t.ts's t(key, { placeholder: value }).
export const UI_STRINGS = [
  // Header / nav
  "Home",
  "Shop",
  "Contact",
  "View cart",
  "Toggle menu",

  // Footer
  "Company",
  "Visit",
  "Our Story",
  "Shop All",
  "Admin",
  "© {year} {name}. All rights reserved.",
  "Free shipping on orders over {amount}.",

  // Home page
  "Our story",
  "Browse",
  "Shop by category",
  "Featured",
  "Customer favorites",
  "View all products →",
  "Free delivery over {amount}",
  "Delivered and installed, no surprise fees at checkout.",
  "{days}-day returns",
  "Not the right fit? Send it back for a full refund.",
  "{years}-year warranty",
  "Every piece is built to last and backed to match.",

  // Product categories (fixed vocabulary — see lib/products.ts Category type)
  "Doors",
  "Kitchen Cabinets",
  "Closets",
  "Sofas",
  "Dining Tables & Chairs",
  "Beds",

  // Shop listing
  "All",
  "All Furniture",
  "No products found in this category yet.",
  "Sort products",
  "Price: Low to High",
  "Price: High to Low",
  "Name: A to Z",

  // Product card / quick add
  "New",
  "Sale",
  "Made to Order",
  "Sold out",
  "Only {count} left",
  "Added ✓",
  "Quick add",
  "{count} reviews",

  // Product detail page
  "Made to order — available in {days} working days",
  "Made to order",
  "Out of stock",
  "Only {stock} left in stock",
  "In stock",
  "Description",
  "Dimensions",
  "Materials",
  "Delivery",
  "Warranty",
  "Returns",
  "Fit Check",
  "SKU {sku}",
  "{min}–{max} days",
  "Installation available",
  "Self-install",
  "Materials & construction",
  "Core material",
  "Finish",
  "Hardware",
  "Additional spec",
  "Installation required — typically about {minutes} minutes.",
  "Professional installation available for {fee}.",
  "Delivery & installation",
  "Installation fee: {fee}",
  "Carrying upstairs (no elevator): {fee} —",
  "year",
  "years",
  "Not covered:",
  "Returns & exchanges",
  " — with an exception for this item",
  "Who pays return shipping?",
  "Refund process",
  "Item arrived damaged?",
  "Payment methods",
  "Will it fit your space?",
  "A quick check before you buy — not a substitute for measuring twice.",
  "Width",
  "Depth",
  "Height",
  "Seat height",
  "Seat depth",
  "Arm height",
  "Leg height",
  "Weight",
  "Custom sizes are available on made-to-order pieces — contact us with your exact opening or space measurements.",
  "You may also like",
  "Complete the project",

  // Add to cart panel
  "Color",
  "Fabric / material",
  "Wood",
  "Actual color may vary slightly from what's shown on screen.",
  "Add to cart",
  "Added to cart ✓",
  "View cart →",
  "Decrease quantity",
  "Increase quantity",

  // Delivery estimator
  "Addis Ababa",
  "Other cities",
  "{min}–{max} working days · {fee} delivery fee",
  "Free delivery on orders over {amount}.",

  // Room fit calculator
  "Enter your space in centimeters to check against this piece's {dims} footprint.",
  "Room width (cm)",
  "Room depth (cm)",
  "Door width (cm)",
  "Check fit",
  "This piece is {width} cm wide — wider than your {room} cm room width.",
  "It'll fit, but leaves less than {margin} cm of clearance along that wall.",
  "This piece is {depth} cm deep — deeper than your {room} cm room depth.",
  "Every side of this piece (smallest: {smallest} cm) is wider than your {door} cm door — it may not fit through.",
  "Looks like a comfortable fit for the numbers you entered.",
  "✅ Should fit",
  "⚠️ Check the numbers",

  // Cart
  "Your cart is empty",
  "Looks like you haven't added anything yet. Go find something you'll actually want to sit on.",
  "Continue shopping",
  "Your Cart",
  "Remove",
  "Order Summary",
  "Subtotal",
  "Shipping and any applicable tax are calculated at checkout.",
  "Checkout",

  // Checkout
  "Shipping details",
  "Full name",
  "Email",
  "Phone number",
  "Address",
  "City",
  "Postal code",
  "You'll be redirected to Chapa to pay securely — your order is recorded once payment is confirmed.",
  "Placing order…",
  "Redirecting to payment…",
  "Place order — {price}",

  // Order confirmation
  "Order placed",
  "Thanks, {name} — order #{id} is confirmed. A receipt has been sent to {email}.",
  "Order #{id}",
  "Total",
  "Shipping to",
  "Confirming your payment…",
  "This usually takes just a moment.",
  "Payment pending",
  "We haven't received payment confirmation for this order yet. If you completed payment, this can take a minute to update — refresh the page, or try the button below.",
  "Payment failed",
  "The payment for this order wasn't completed. You can try again below, or contact us if you were charged.",
  "Try payment again",
  "Check payment status",

  // Contact
  "Visit the showroom",
  "Talk to us",
  "Hours",
  "Name",
  "Message",
  "Send message",
  "Message sent",
  "We'll get back to you soon.",

  // Language switcher
  "Language",
] as const;
