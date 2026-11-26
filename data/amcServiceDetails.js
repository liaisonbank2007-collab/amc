const commonIndustries = [
  "Restaurants & Commercial Kitchens",
  "Hotels & Hospitality",
  "Hospitals & Healthcare",
  "Corporate Offices",
  "Factories & Industrial Facilities",
  "Retail & Commercial Establishments",
];

const commonBenefits = [
  {
    title: "Centralised Service Coordination",
    description:
      "Coordinate essential maintenance requirements through one professional service partner.",
  },
  {
    title: "Planned Maintenance",
    description:
      "Organise periodic inspections and maintenance activities according to your requirements.",
  },
  {
    title: "Business Continuity",
    description:
      "Address maintenance requirements proactively and support smoother business operations.",
  },
  {
    title: "Documentation Support",
    description:
      "Maintain relevant service records, inspection details and supporting documentation.",
  },
];

const services = {
  "fire-extinguisher-refilling": {
    title: "Fire Extinguisher Refilling",
    shortTitle: "Fire Extinguisher AMC",
    category: "Fire Protection & Maintenance",
    icon: "/images/FireExtinguisherandFlameShieldIcon.png",

    seoTitle:
      "Fire Extinguisher Refilling & AMC Services | Liaison Bank",
    seoDescription:
      "Looking for fire extinguisher refilling and maintenance services? Liaison Bank supports businesses with inspection, refilling coordination and fire safety maintenance.",
    keywords: [
      "fire extinguisher refilling services",
      "fire extinguisher AMC",
      "fire extinguisher maintenance",
      "commercial fire extinguisher refilling",
      "fire safety maintenance services",
      "fire extinguisher inspection",
      "annual fire safety maintenance",
    ],

    heroTitle: "Fire Extinguisher Refilling & Maintenance Services",
    heroHighlight: "Keep Your Fire Protection Equipment Ready.",
    heroDescription:
      "Support workplace fire safety with planned fire extinguisher inspections, refilling coordination and maintenance services for commercial and industrial establishments.",

    introTitle: "Reliable Fire Extinguisher Maintenance for Every Business",
    intro: [
      "Fire extinguishers are essential fire protection equipment in commercial buildings, restaurants, hotels, offices, warehouses and industrial facilities. Regular inspection and timely servicing help ensure that equipment remains available when an emergency occurs.",
      "Liaison Bank provides fire extinguisher refilling and AMC service coordination to help businesses manage their fire protection maintenance requirements. We assist with identifying servicing needs, coordinating refilling activities and maintaining relevant service records.",
    ],

    challenges: [
      "Expired or overdue fire extinguisher servicing.",
      "Incorrect pressure or damaged equipment indicators.",
      "Difficulty tracking multiple extinguisher service dates.",
      "Maintenance coordination across multiple business locations.",
      "Incomplete servicing and maintenance records.",
    ],

    scope: [
      "Fire extinguisher condition and visual inspection coordination.",
      "Identification of equipment requiring refilling or servicing.",
      "Coordination of suitable refilling and maintenance activities.",
      "Checking service labels and maintenance records.",
      "Periodic service scheduling and follow-up assistance.",
      "Documentation support for completed service activities.",
    ],

    processDescription:
      "We help businesses organise fire extinguisher servicing through a structured maintenance approach.",

    faqs: [
      {
        q: "What is included in fire extinguisher refilling services?",
        a: "Depending on the equipment and service scope, activities may include condition inspection, identification of refilling requirements, refilling coordination, service labelling and maintenance documentation.",
      },
      {
        q: "How frequently should fire extinguishers be serviced?",
        a: "Service frequency depends on extinguisher type, manufacturer recommendations, applicable standards, inspection findings and regulatory requirements. Equipment should also be checked periodically for visible damage and abnormal pressure indications.",
      },
      {
        q: "Does Liaison Bank provide fire extinguisher AMC services?",
        a: "Yes. Liaison Bank can coordinate planned fire extinguisher maintenance and refilling requirements under an agreed AMC service scope.",
      },
      {
        q: "Which businesses require fire extinguisher maintenance?",
        a: "Restaurants, hotels, offices, hospitals, factories, warehouses, retail establishments and other premises using fire extinguishers can benefit from scheduled maintenance.",
      },
      {
        q: "Can multiple fire extinguishers be maintained under one AMC?",
        a: "Yes. Businesses can discuss a maintenance plan covering multiple extinguishers and locations, subject to the agreed equipment inventory and service scope.",
      },
    ],
  },

  "fire-safety-audit": {
    title: "Fire Safety Audit",
    shortTitle: "Fire Safety AMC",
    category: "Fire Safety Inspection",
    icon: "/images/GovernmentCertifiedAuthorityicon.png",

    seoTitle:
      "Fire Safety Audit & AMC Services for Businesses | Liaison Bank",
    seoDescription:
      "Explore fire safety audit and AMC support for restaurants, hotels, offices and industries. Liaison Bank assists with fire safety inspections and maintenance coordination.",
    keywords: [
      "fire safety audit services",
      "fire safety audit for commercial buildings",
      "fire safety AMC",
      "fire safety inspection services",
      "fire prevention audit",
      "commercial fire safety maintenance",
      "fire safety documentation",
    ],

    heroTitle: "Professional Fire Safety Audit Services",
    heroHighlight: "Build a More Prepared Business Environment.",
    heroDescription:
      "Organise fire safety inspections, identify maintenance requirements and coordinate essential fire protection activities for your business premises.",

    introTitle: "A Structured Approach to Commercial Fire Safety",
    intro: [
      "Fire safety management involves more than installing firefighting equipment. Commercial establishments need to monitor fire protection systems, maintain access to emergency equipment and address potential safety concerns.",
      "Liaison Bank assists businesses with fire safety audit coordination and ongoing maintenance requirements. Our approach focuses on understanding the premises, identifying service requirements and coordinating appropriate follow-up activities.",
    ],

    challenges: [
      "Fire protection equipment requiring inspection.",
      "Obstructed emergency access and exit routes.",
      "Incomplete fire safety maintenance records.",
      "Unidentified maintenance requirements.",
      "Difficulty coordinating periodic fire safety inspections.",
    ],

    scope: [
      "Coordination of fire safety inspections.",
      "Review of fire extinguisher availability and condition.",
      "Inspection coordination for fire protection equipment.",
      "Review of emergency access and evacuation arrangements.",
      "Identification of observed maintenance requirements.",
      "Assistance with fire safety documentation and follow-ups.",
    ],

    processDescription:
      "Our approach helps businesses understand their fire safety maintenance requirements and organise the necessary follow-up.",

    faqs: [
      {
        q: "What is a fire safety audit?",
        a: "A fire safety audit is an assessment of fire prevention arrangements, firefighting equipment, emergency access, evacuation provisions and related safety practices within a premises.",
      },
      {
        q: "Why is a fire safety audit important for businesses?",
        a: "It helps businesses identify potential fire safety gaps, review equipment condition and understand maintenance or corrective actions that may be required.",
      },
      {
        q: "Does Liaison Bank provide fire safety AMC support?",
        a: "Yes. Liaison Bank assists with planned fire safety inspections, maintenance coordination and related documentation based on the agreed scope.",
      },
      {
        q: "Which establishments should consider fire safety audits?",
        a: "Restaurants, hotels, offices, hospitals, factories, warehouses, shopping establishments and other commercial premises should periodically review their fire safety arrangements.",
      },
      {
        q: "Is a fire safety audit certificate included?",
        a: "Any certificate or formal audit deliverable depends on the applicable authority requirements, the appointed competent agency and the agreed service scope. It should not be assumed to be included in every AMC.",
      },
    ],
  },

  "electrical-audit": {
    title: "Electrical Audit",
    shortTitle: "Electrical Audit AMC",
    category: "Electrical Safety & Inspection",
    icon: "/images/HandheldMultimeterwithLightningProbe.png",

    seoTitle:
      "Electrical Audit & Inspection Services | Liaison Bank",
    seoDescription:
      "Liaison Bank supports commercial electrical audits, electrical safety inspections and planned maintenance coordination for offices, restaurants and industrial facilities.",
    keywords: [
      "electrical audit services",
      "electrical safety audit",
      "commercial electrical inspection",
      "electrical maintenance AMC",
      "electrical installation inspection",
      "electrical safety inspection for industries",
      "electrical audit for restaurants",
    ],

    heroTitle: "Electrical Audit & Inspection Services",
    heroHighlight: "Support Safer and More Reliable Electrical Systems.",
    heroDescription:
      "Manage electrical inspection and maintenance requirements through a structured service approach for commercial and industrial properties.",

    introTitle: "Electrical System Inspections for Business Premises",
    intro: [
      "Electrical installations support almost every business activity. Distribution panels, wiring, electrical equipment and connected infrastructure require appropriate inspection and maintenance to help identify potential issues.",
      "Liaison Bank assists commercial and industrial establishments with electrical audit coordination and planned maintenance support. The service scope can be structured around the premises, electrical infrastructure and inspection requirements.",
    ],

    challenges: [
      "Ageing electrical installations and loose connections.",
      "Overloaded circuits and distribution boards.",
      "Unidentified electrical maintenance requirements.",
      "Lack of periodic electrical inspection records.",
      "Difficulty coordinating electrical audits across facilities.",
    ],

    scope: [
      "Electrical installation inspection coordination.",
      "Distribution board and panel inspection support.",
      "Review of visible wiring and electrical connections.",
      "Identification of potential electrical safety concerns.",
      "Thermal inspection coordination where required.",
      "Electrical maintenance recommendations and documentation.",
    ],

    processDescription:
      "We help businesses organise electrical inspections and follow-up maintenance according to the requirements of their premises.",

    faqs: [
      {
        q: "What is an electrical safety audit?",
        a: "An electrical safety audit reviews electrical installations and associated safety arrangements to identify potential hazards, maintenance requirements and areas requiring attention.",
      },
      {
        q: "What does an electrical audit cover?",
        a: "Depending on the agreed scope, it may include distribution boards, electrical panels, visible wiring, connections, protective devices, earthing arrangements and thermal inspection coordination.",
      },
      {
        q: "Do restaurants and commercial kitchens need electrical audits?",
        a: "Electrical audits can help restaurants and commercial kitchens review electrical installations supporting kitchen equipment, refrigeration, lighting and other operational systems.",
      },
      {
        q: "Can electrical inspections be scheduled under an AMC?",
        a: "Yes. Businesses can discuss periodic electrical inspection and maintenance coordination under an agreed Annual Maintenance Contract.",
      },
      {
        q: "Does an electrical audit include a certificate?",
        a: "Certificate issuance depends on the inspection scope, applicable requirements and the qualifications of the authorised professional or agency conducting the assessment.",
      },
    ],
  },

  "png-infrastructure-audit": {
    title: "PNG Infrastructure Audit",
    shortTitle: "PNG Infrastructure AMC",
    category: "Gas Infrastructure & Safety",
    icon: "/images/OrangeHandledPipelineValveIcon.png",

    seoTitle:
      "PNG Pipeline Audit & Gas Infrastructure Inspection | Liaison Bank",
    seoDescription:
      "Explore PNG pipeline inspection and gas infrastructure audit support for restaurants, hotels and commercial establishments through Liaison Bank.",
    keywords: [
      "PNG pipeline audit",
      "PNG infrastructure audit",
      "PNG gas pipeline inspection",
      "commercial gas pipeline maintenance",
      "PNG safety inspection",
      "restaurant gas pipeline inspection",
      "gas infrastructure AMC",
    ],

    heroTitle: "PNG Infrastructure Audit & Inspection",
    heroHighlight: "Support Safe Gas Infrastructure Management.",
    heroDescription:
      "Organise PNG pipeline inspections, gas infrastructure maintenance coordination and periodic safety-related assessments for commercial establishments.",

    introTitle: "Planned Inspection Support for PNG Infrastructure",
    intro: [
      "Piped Natural Gas infrastructure plays an important role in restaurants, hotels, commercial kitchens and other establishments. Gas pipelines, connections, valves and associated installations require appropriate inspection and maintenance.",
      "Liaison Bank supports businesses with PNG infrastructure audit coordination and periodic maintenance planning. The service approach focuses on identifying inspection requirements, coordinating qualified service professionals and organising relevant documentation.",
    ],

    challenges: [
      "Difficulty tracking periodic gas infrastructure inspections.",
      "Visible deterioration or damage around pipeline installations.",
      "Maintenance requirements involving valves and connections.",
      "Lack of organised inspection documentation.",
      "Coordination of gas infrastructure servicing across premises.",
    ],

    scope: [
      "PNG pipeline inspection coordination.",
      "Visual condition assessment of accessible infrastructure.",
      "Coordination of leak detection checks by qualified professionals.",
      "Inspection coordination for accessible valves and connections.",
      "Identification and reporting of observed concerns.",
      "Maintenance follow-up and documentation support.",
    ],

    processDescription:
      "We coordinate PNG infrastructure inspection requirements with attention to premises-specific needs and qualified technical support.",

    faqs: [
      {
        q: "What is a PNG infrastructure audit?",
        a: "A PNG infrastructure audit reviews relevant piped natural gas installations, accessible pipeline components, connections and associated safety-related maintenance requirements.",
      },
      {
        q: "Why should restaurants inspect PNG pipelines?",
        a: "Restaurants and commercial kitchens often depend on gas infrastructure for cooking operations. Appropriate inspections help identify potential maintenance concerns and support safe infrastructure management.",
      },
      {
        q: "Does PNG inspection include gas leak detection?",
        a: "Leak detection can be included in the agreed service scope and should be carried out using appropriate methods by qualified professionals.",
      },
      {
        q: "Can PNG infrastructure inspections be included in an AMC?",
        a: "Yes. Businesses can discuss periodic inspection coordination and maintenance support under a suitable AMC arrangement.",
      },
      {
        q: "What should I do if I suspect a gas leak?",
        a: "Immediately follow your gas provider's emergency instructions, avoid operating electrical switches or ignition sources, shut off the supply only if it is safe to do so, evacuate the affected area and contact the authorised gas emergency service.",
      },
    ],
  },

  "pest-control": {
    title: "Commercial Pest Control",
    shortTitle: "Pest Control AMC",
    category: "Pest Management & Hygiene",
    icon: "/images/OrangeShieldBugEmblem.png",

    seoTitle:
      "Commercial Pest Control & AMC Services | Liaison Bank",
    seoDescription:
      "Liaison Bank offers commercial pest control AMC coordination for restaurants, hotels, offices, healthcare facilities and industrial establishments.",
    keywords: [
      "commercial pest control services",
      "pest control AMC",
      "restaurant pest control",
      "hotel pest control services",
      "cockroach control for restaurants",
      "rodent control services",
      "commercial pest management",
    ],

    heroTitle: "Commercial Pest Control Services",
    heroHighlight: "Maintain a Cleaner Business Environment.",
    heroDescription:
      "Plan preventive pest management for restaurants, hotels, offices, healthcare facilities and other commercial premises through structured AMC support.",

    introTitle: "Professional Pest Management for Commercial Establishments",
    intro: [
      "Pest management is an important part of maintaining hygiene across food establishments, hospitality facilities, healthcare premises and commercial buildings. Uncontrolled pest activity can affect operations, storage areas and the overall business environment.",
      "Liaison Bank assists businesses with scheduled pest control service coordination and preventive maintenance planning. Service requirements can be tailored to the premises, pest activity, operating environment and agreed treatment scope.",
    ],

    challenges: [
      "Recurring cockroach and insect activity.",
      "Rodent activity in storage and service areas.",
      "Pest concerns around commercial kitchens.",
      "Inconsistent pest treatment schedules.",
      "Difficulty maintaining treatment records.",
    ],

    scope: [
      "Premises assessment and pest activity identification.",
      "Cockroach and crawling insect treatment coordination.",
      "Rodent control and monitoring arrangements.",
      "Preventive treatment planning for relevant areas.",
      "Identification of possible pest entry points.",
      "Scheduled service visits and treatment documentation.",
    ],

    processDescription:
      "Our pest management approach combines premises assessment, treatment planning, scheduled visits and follow-up support.",

    faqs: [
      {
        q: "What is included in commercial pest control AMC?",
        a: "Depending on the premises and agreement, services may include pest assessment, preventive treatment, cockroach control, rodent management, monitoring and scheduled follow-up visits.",
      },
      {
        q: "Is pest control important for restaurants?",
        a: "Yes. Pest management is an important part of maintaining hygiene in food preparation, storage, waste management and service areas.",
      },
      {
        q: "How frequently should pest control be carried out?",
        a: "The frequency depends on the type of premises, pest activity, treatment method and operational requirements. A suitable schedule can be developed after assessing the property.",
      },
      {
        q: "Does Liaison Bank provide rodent control?",
        a: "Rodent management can be discussed as part of the commercial pest control service scope, including monitoring and appropriate treatment coordination.",
      },
      {
        q: "Are pest control treatments safe for food establishments?",
        a: "Treatment methods and products should be selected by qualified pest management professionals according to the premises, product instructions and applicable safety requirements. Businesses should follow all preparation and re-entry instructions.",
      },
    ],
  },

  "water-tank-cleaning": {
    title: "Water Tank Cleaning",
    shortTitle: "Water Tank Cleaning AMC",
    category: "Water Hygiene & Maintenance",
    icon: "/images/WaterDropandTestTubeIcon.png",

    seoTitle:
      "Commercial Water Tank Cleaning & AMC Services | Liaison Bank",
    seoDescription:
      "Book commercial water tank cleaning and scheduled maintenance support for restaurants, hotels, offices and industrial facilities with Liaison Bank.",
    keywords: [
      "commercial water tank cleaning",
      "water tank cleaning AMC",
      "overhead water tank cleaning",
      "underground water tank cleaning",
      "restaurant water tank cleaning",
      "hotel water tank cleaning",
      "water tank maintenance services",
    ],

    heroTitle: "Commercial Water Tank Cleaning Services",
    heroHighlight: "Support Cleaner Water Storage Facilities.",
    heroDescription:
      "Maintain commercial water storage infrastructure with planned tank cleaning, maintenance coordination and periodic service scheduling.",

    introTitle: "Scheduled Water Tank Cleaning for Commercial Properties",
    intro: [
      "Water storage tanks are essential infrastructure in restaurants, hotels, hospitals, offices and industrial facilities. Over time, sediment, dirt and other unwanted material can accumulate inside storage tanks, making periodic cleaning and maintenance important.",
      "Liaison Bank helps businesses coordinate water tank cleaning services and scheduled maintenance requirements. Our approach covers premises assessment, cleaning arrangements, service scheduling and relevant maintenance records.",
    ],

    challenges: [
      "Sediment and dirt accumulation in water tanks.",
      "Irregular cleaning and maintenance schedules.",
      "Difficult access to overhead and underground tanks.",
      "Multiple water storage tanks across a property.",
      "Missing service and cleaning records.",
    ],

    scope: [
      "Assessment of accessible water storage facilities.",
      "Coordination of overhead water tank cleaning.",
      "Coordination of underground water tank cleaning.",
      "Removal of accumulated sediment and deposits.",
      "Cleaning and disinfection coordination where applicable.",
      "Service scheduling and maintenance documentation.",
    ],

    processDescription:
      "We organise water tank cleaning around your facility's storage capacity, access conditions and maintenance requirements.",

    faqs: [
      {
        q: "What is included in commercial water tank cleaning?",
        a: "Depending on the tank and agreed scope, the service may include assessment, draining arrangements, removal of sediment, internal cleaning, disinfection where appropriate and maintenance documentation.",
      },
      {
        q: "How frequently should commercial water tanks be cleaned?",
        a: "Cleaning frequency depends on the type of premises, storage conditions, water quality and applicable public health or regulatory guidance. A suitable schedule should be established for the facility.",
      },
      {
        q: "Does Liaison Bank coordinate overhead and underground tank cleaning?",
        a: "Yes. Businesses can enquire about cleaning arrangements for overhead and underground water storage tanks based on accessibility and the agreed service scope.",
      },
      {
        q: "Can water tank cleaning be included in an AMC?",
        a: "Yes. Periodic water tank cleaning and maintenance coordination can be discussed as part of a suitable AMC plan.",
      },
      {
        q: "Does water tank cleaning include water quality testing?",
        a: "Water quality sampling or laboratory testing can be discussed separately or included where agreed. Cleaning alone should not be treated as proof of water potability.",
      },
    ],
  },

  "license-renewal-assistance": {
    title: "Business License Renewal Assistance",
    shortTitle: "License Renewal AMC",
    category: "Business Licensing & Documentation",
    icon: "/images/CharcoalChecklistDocumentIcon.png",

    seoTitle:
      "Business License Renewal & Documentation Assistance | Liaison Bank",
    seoDescription:
      "Get assistance with business license renewal tracking, documentation and application coordination for restaurants, hotels, offices and commercial establishments.",
    keywords: [
      "business license renewal services",
      "commercial license renewal assistance",
      "restaurant license renewal",
      "hotel license renewal",
      "business licensing assistance",
      "license renewal AMC",
      "license documentation support",
    ],

    heroTitle: "Business License Renewal Assistance",
    heroHighlight: "Stay Organised with Your Business Licensing.",
    heroDescription:
      "Manage recurring business license requirements through renewal tracking, documentation assistance and application coordination.",

    introTitle: "Simplifying Recurring Business License Requirements",
    intro: [
      "Commercial establishments may need to manage multiple licenses, permissions, registrations and certificates depending on their activities, premises and applicable authorities. Tracking renewal dates and preparing the required documentation can become challenging.",
      "Liaison Bank assists businesses with license renewal tracking, documentation coordination and application-related support. We help organise recurring licensing requirements so business owners can focus on their operations.",
    ],

    challenges: [
      "Difficulty tracking multiple license expiry dates.",
      "Incomplete renewal documentation.",
      "Uncertainty about applicable renewal requirements.",
      "Coordination with different departments and authorities.",
      "Missed follow-ups and recurring renewal schedules.",
    ],

    scope: [
      "Review of existing license and certificate details.",
      "Tracking of relevant renewal dates.",
      "Documentation checklist and preparation assistance.",
      "Application coordination for applicable renewals.",
      "Follow-up support with relevant departments.",
      "Maintenance of license records and renewal schedules.",
    ],

    processDescription:
      "We help businesses organise their licensing requirements through documentation review, renewal tracking and application coordination.",

    faqs: [
      {
        q: "What is business license renewal assistance?",
        a: "It is support for identifying renewal requirements, organising documents, tracking expiry dates and coordinating applicable license renewal applications.",
      },
      {
        q: "Which businesses can use license renewal assistance?",
        a: "Restaurants, hotels, retail establishments, offices, healthcare facilities, factories and other businesses with recurring licensing requirements can enquire about this service.",
      },
      {
        q: "Does Liaison Bank help track license expiry dates?",
        a: "Yes. License validity tracking and renewal scheduling can be included in the agreed service scope based on the documents and information provided by the business.",
      },
      {
        q: "Can multiple business licenses be managed under one AMC?",
        a: "Businesses can discuss a coordinated renewal support arrangement covering multiple applicable licenses and certificates.",
      },
      {
        q: "Does Liaison Bank guarantee license approval?",
        a: "No. Final approval is determined by the relevant government department or competent authority. Liaison Bank provides assistance with documentation, coordination and application follow-ups.",
      },
    ],
  },
};

export { commonIndustries, commonBenefits };
export default services;