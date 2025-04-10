// Define our own Category type instead of importing from Prisma
type Category = "SOCIAL" | "MENTAL" | "PHYSICAL";

export const ageRangeOptions = [
  "0-15",
  "16-18",
  "19-24",
  "25-34",
  "35-44",
  "45-54",
  "55+",
];

export const categoryToOptions: {
  [key in Category]: string[];
} = {
  SOCIAL: [
    "FRIENDSHIPS / PEER RELATIONSHIPS",
    "ROMANTIC / SEXUAL RELATIONSHIPS",
    "FAMILY",
    "BULLYING (IN PERSON AND ONLINE)",
    "SCHOOL",
    "RACIAL & CULTURAL IDENTITY",
    "LGBTQ+ IDENTITY",
    "CHRONIC ILLNESS & DISABILITY",
    "SOCIAL MEDIA & MEDIA LITERACY",
    "COMMUNITY ENGAGEMENT",
  ],
  MENTAL: [
    "MENTAL HEALTH",
    "COPING SKILLS",
    "SELF IMAGE",
    "GRIEF AND LOSS",
    "ADDICTION & SUBSTANCE ABUSE",
    "INTERNET & TECHNOLOGY",
    "ABUSE",
    "SCHOOL",
    "CHRONIC ILLNESS & DISABILITY",
  ],
  PHYSICAL: [
    "NUTRITION",
    "DISORDERED EATING",
    "FITNESS & EXERCISE",
    "SEXUAL HEALTH",
    "TRANSGENDER HEALTH",
    "SLEEP",
    "GENERAL PHYSICAL HEALTH",
    "CHRONIC ILLNESS & DISABILITY",
  ],
};
