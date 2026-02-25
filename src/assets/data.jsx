import { BellRing, Monitor, Sliders } from "lucide-react";

const navLinks = ["Home", "About", "Technology", "Specs", "Reviews"];

const chartData = [40, 60, 30, 80, 50, 90, 45, 70, 85, 40, 60, 100];
const specs = [
  { label: "Inverter Dimensions", value: '74.4" x 41.2" x 1.57"' },
  { label: "Inverter Dimensions", value: '26" x 16" x 6"' },
  { label: "Materials", value: '26" x 16" x 6"' },
];

const services = [
  {
    title: "Monitor Energy Flow",
    icon: <Monitor size={14} />,
    bg: "bg-[url('/images/solar-2.jpg')] bg-cover bg-center saturate-150", // Placeholder for image
  },
  {
    title: "Customize Preferences",
    icon: <Sliders size={14} />,
    bg: "bg-[url('/images/solar-1.jpg')] bg-cover bg-center saturate-150", // Placeholder for image
  },
  {
    title: "Get Urgent Alerts",
    icon: <BellRing size={14} />,
    bg: "bg-[url('/images/solar-3.jpg')] bg-cover bg-center saturate-150", // Placeholder for image
    isComingSoon: true,
  },
];

const testimonials = [
  {
    text: "Switching to Goreno was the best decision for our home. The Powerwall integration is seamless and the design is stunning.",
    imageSrc: "/images/avatar-1.png",
    name: "Jamie Rivera",
    username: "@jamietechguru00",
  },
  {
    text: "Our monthly energy costs have dropped by 80%. The real-time monitoring makes managing our consumption addictive.",
    imageSrc: "/images/avatar-2.png",
    name: "Josh Smith",
    username: "@jjsmith",
  },
  {
    text: "The installation process was professional and the aesthetic of the panels actually adds value to our modern roof.",
    imageSrc: "/images/avatar-3.png",
    name: "Morgan Lee",
    username: "@morganleewhiz",
  },
  {
    text: "Finally, a solar company that cares about design as much as efficiency. It's the Apple of energy.",
    imageSrc: "/images/avatar-4.png",
    name: "Casey Jordan",
    username: "@caseyj",
  },
  {
    text: "Customer support helped me optimize my AI Energy Mode, and now my house runs itself during peak hours.",
    imageSrc: "/images/avatar-5.png",
    name: "Taylor Kim",
    username: "@taylorkimm",
  },
  {
    text: "The most reliable backup system I've ever used. We had a neighborhood outage and didn't even notice.",
    imageSrc: "/images/avatar-6.png",
    name: "Riley Smith",
    username: "@rileysmith1",
  },
  {
    text: "Clean energy shouldn't look industrial. Goreno proved that it can be a beautiful part of home architecture.",
    imageSrc: "/images/avatar-7.png",
    name: "Jordan Patels",
    username: "@jpatelsdesign",
  },
  {
    text: "Assigning energy priorities in the app is so intuitive. We prioritize our EV charging overnight effortlessly.",
    imageSrc: "/images/avatar-8.png",
    name: "Sam Dawson",
    username: "@dawsontechtips",
  },
  {
    text: "Investment-grade hardware with a software experience that is lightyears ahead of the competition.",
    imageSrc: "/images/avatar-9.png",
    name: "Casey Harper",
    username: "@casey09",
  },
];

export { navLinks, chartData, specs, services, testimonials };
