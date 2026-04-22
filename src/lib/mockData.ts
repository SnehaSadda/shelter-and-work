export type ResourceStatus = "available" | "full" | "closed";

export type Resource = {
  id: string;
  name: string;
  type: "shelter" | "food" | "medical" | "clothing";
  address: string;
  distanceKm: number;
  status: ResourceStatus;
  capacity?: string;
  hours: string;
};

export type FeedPost = {
  id: string;
  org: string;
  role: "NGO" | "Volunteer" | "Employer";
  time: string;
  title: string;
  body: string;
  helpful: number;
};

export type Job = {
  id: string;
  title: string;
  org: string;
  location: string;
  pay: string;
  type: "Daily" | "Short-term" | "Part-time";
  contact: string;
};

export const resources: Resource[] = [
  { id: "r1", name: "Sunrise Night Shelter", type: "shelter", address: "120 River St", distanceKm: 0.8, status: "available", capacity: "12 beds open", hours: "6pm – 8am" },
  { id: "r2", name: "Hope Kitchen", type: "food", address: "44 Market Ave", distanceKm: 1.2, status: "available", hours: "Open now · until 9pm" },
  { id: "r3", name: "Downtown Family Shelter", type: "shelter", address: "9 Oak Lane", distanceKm: 2.1, status: "full", capacity: "Waitlist", hours: "24/7" },
  { id: "r4", name: "St. Mary's Free Clinic", type: "medical", address: "210 Elm Rd", distanceKm: 1.7, status: "available", hours: "9am – 5pm" },
  { id: "r5", name: "Warm Threads Closet", type: "clothing", address: "78 Pine Blvd", distanceKm: 3.0, status: "closed", hours: "Opens Tue 10am" },
  { id: "r6", name: "Eastside Community Meal", type: "food", address: "501 Park Way", distanceKm: 2.8, status: "available", hours: "5pm – 7pm" },
];

export const feed: FeedPost[] = [
  { id: "f1", org: "Hope Kitchen", role: "NGO", time: "12 min ago", title: "Hot dinner tonight", body: "Serving 200 hot meals from 6pm at 44 Market Ave. No ID needed. Bring a friend.", helpful: 38 },
  { id: "f2", org: "Sunrise Shelter", role: "NGO", time: "1 hr ago", title: "12 beds available tonight", body: "Walk-ins welcome from 6pm. Showers and laundry available. Pets allowed in kennel area.", helpful: 21 },
  { id: "f3", org: "Maria L.", role: "Volunteer", time: "3 hr ago", title: "Free winter coats", body: "Distributing coats and blankets at Central Park east entrance, 2pm–4pm Saturday.", helpful: 54 },
  { id: "f4", org: "City Mobile Clinic", role: "NGO", time: "Yesterday", title: "Free flu shots this week", body: "Mobile clinic visiting downtown Wed–Fri, 10am–3pm. No appointment needed.", helpful: 17 },
];

export const jobs: Job[] = [
  { id: "j1", title: "Warehouse helper (today)", org: "GreenBox Logistics", location: "Industrial Park, 3 km", pay: "$18/hr · cash daily", type: "Daily", contact: "Call (555) 123-4480" },
  { id: "j2", title: "Event setup crew", org: "City Events Co.", location: "Riverside Plaza", pay: "$120 / shift", type: "Short-term", contact: "Text (555) 992-1144" },
  { id: "j3", title: "Kitchen prep assistant", org: "Hope Kitchen", location: "44 Market Ave", pay: "$16/hr + meals", type: "Part-time", contact: "Apply onsite 9am" },
  { id: "j4", title: "Moving help (weekend)", org: "Quick Movers", location: "Various", pay: "$20/hr", type: "Short-term", contact: "Call (555) 776-2210" },
];
