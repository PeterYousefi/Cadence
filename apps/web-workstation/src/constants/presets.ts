import { ArchitecturePreset } from '../types/cadence';

export const ARCHITECTURE_PRESETS: ArchitecturePreset[] = [
  {
    id: 'tokyo-trip',
    title: '✈️ Tokyo 7-Day Itinerary',
    badge: 'Travel Plan',
    color: '#0284C7',
    description: 'Curated 7-day Tokyo vacation plan with neighborhood explorations, culinary hot-spots, Mt. Fuji day trip, and digital art museums.',
    mermaid: `graph TD
  subgraph PreTrip ["Trip Preparation & Arrival"]
    Flight["✈️ Arrive Haneda (HND) // Day 1"] --> ShinjukuHotel["🏨 Check-in Shinjuku Hotel"]
    ShinjukuHotel --> SuicaCard["💳 Pick up Welcome Suica Card"]
  end

  subgraph Exploration ["Tokyo Neighborhood Days 2-4"]
    ShinjukuHotel --> Shibuya["🌆 Day 2: Shibuya Crossing & Harajuku"]
    Shibuya --> MeijiShrine["⛩️ Meiji Jingu Forest Walk"]
    Shibuya --> Akihabara["⚡ Day 3: Akihabara Electric Town & Retro Games"]
    Akihabara --> Asakusa["🏮 Senso-ji Temple & Street Food"]
    ShinjukuHotel --> Ginza["🍣 Day 4: Tsukiji Outer Market & Ginza Art"]
  end

  subgraph DayTrips ["Excursions & Farewell Days 5-7"]
    ShinjukuHotel --> HakoneTrip["🗻 Day 5: Mt. Fuji & Hakone Hot Springs"]
    HakoneTrip --> TeamLab["✨ Day 6: teamLab Planets Digital Art"]
    TeamLab --> Omoide["🍢 Evening: Omoide Yokocho Dinner"]
    Omoide --> Departure["✈️ Day 7: Souvenir Shopping & Flight Home"]
  end

  style Flight fill:#FFD1BA,stroke:#FF4F00,stroke-width:2px,color:#111
  style ShinjukuHotel fill:#C7F9CC,stroke:#008A4B,stroke-width:2px,color:#111
  style Shibuya fill:#DBCDF0,stroke:#7C3AED,stroke-width:2px,color:#111
  style HakoneTrip fill:#BEE1E6,stroke:#0284C7,stroke-width:2px,color:#111
  style TeamLab fill:#FAEDCD,stroke:#D97706,stroke-width:2px,color:#111
  style Departure fill:#FDE2E4,stroke:#E11D48,stroke-width:2px,color:#111`
  },
  {
    id: 'wedding-plan',
    title: '💍 Wedding Planning Timeline',
    badge: 'Event Schedule',
    color: '#E11D48',
    description: '12-month master wedding coordination schedule: venue selection, attire fittings, catering tastings, RSVPs, and rehearsal.',
    mermaid: `graph TD
  subgraph Phase1 ["12 to 9 Months Before"]
    Budget["💰 Establish Total Budget & Guest Count"] --> VenueSearch["🏰 Tour & Book Ceremony / Reception Venue"]
    VenueSearch --> DateLocked["📅 Confirm Official Wedding Date"]
    DateLocked --> Planner["📋 Hire Wedding Planner & Photographer"]
  end

  subgraph Phase2 ["8 to 4 Months Before"]
    DateLocked --> Attire["👗 Wedding Dress & Tuxedo Fitting"]
    DateLocked --> Catering["🥂 Catering & Cake Tasting Sessions"]
    DateLocked --> MusicFloral["💐 Florals, Decor & Live Band / DJ"]
    Attire --> SaveTheDates["💌 Mail Save-the-Date Invitations"]
  end

  subgraph Phase3 ["3 Months to Wedding Day"]
    SaveTheDates --> RSVPs["✅ Collect Final RSVP Headcount"]
    RSVPs --> SeatingChart["🪑 Design Seating Chart & Placecards"]
    SeatingChart --> Rehearsal["🎉 Rehearsal Dinner & Final Walkthrough"]
    Rehearsal --> Ceremony["💍 Ceremony & Evening Reception!"]
  end

  style Budget fill:#FAEDCD,stroke:#D97706,stroke-width:2px,color:#111
  style VenueSearch fill:#FDE2E4,stroke:#E11D48,stroke-width:2px,color:#111
  style DateLocked fill:#C7F9CC,stroke:#008A4B,stroke-width:2px,color:#111
  style SaveTheDates fill:#DBCDF0,stroke:#7C3AED,stroke-width:2px,color:#111
  style Ceremony fill:#FFD1BA,stroke:#FF4F00,stroke-width:3px,color:#111`
  },
  {
    id: 'startup-launch',
    title: '🚀 Startup Launch Roadmap',
    badge: 'Project Roadmap',
    color: '#7C3AED',
    description: '3-stage fast-track startup launch blueprint: customer problem validation, alpha prototype build, and multi-channel go-to-market.',
    mermaid: `graph TD
  subgraph Ideation ["Sprint 1: Validation & Prototyping"]
    Problem["💡 Problem Discovery & 30 Customer Interviews"] --> Spec["📝 Functional Spec & User Journey"]
    Spec --> ClickablePrototype["🎨 Figma Clickable Prototype"]
  end

  subgraph Build ["Sprint 2: Alpha Development & Architecture"]
    ClickablePrototype --> CoreEngine["⚙️ Build Core Engine & Boson Voice API"]
    CoreEngine --> BetaTesters["👥 Onboard 50 Private Alpha Users"]
    BetaTesters --> FeedbackLoop["🔄 Rapid Bug Fixes & Daily UX Polish"]
  end

  subgraph GoToMarket ["Sprint 3: Launch & Distribution"]
    FeedbackLoop --> LandingPage["🌐 High-Converting Landing Page & Demo Video"]
    LandingPage --> ProductHunt["🚀 Product Hunt & Hacker News Launch"]
    ProductHunt --> First1000["📈 Scale to First 1,000 Paying Customers"]
  end

  style Problem fill:#FAEDCD,stroke:#D97706,stroke-width:2px,color:#111
  style CoreEngine fill:#FFD1BA,stroke:#FF4F00,stroke-width:2px,color:#111
  style BetaTesters fill:#C7F9CC,stroke:#008A4B,stroke-width:2px,color:#111
  style ProductHunt fill:#DBCDF0,stroke:#7C3AED,stroke-width:2px,color:#111
  style First1000 fill:#BEE1E6,stroke:#0284C7,stroke-width:3px,color:#111`
  }
];
