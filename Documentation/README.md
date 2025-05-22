# myAdvo

## Description

Marginalized communities — including queer individuals and people of color — often face discrimination, financial constraints, and transportation issues that hinder in person access to vital services..

Stigma & discrimination, financial issues, or legal issues can all stand between people and the resources they need. When barriers prevent access to services, people can put themselves in harm’s way trying to find the help they need.

myAdvo is a resource and referral tool in development that will allow users to have access to high quality, safe, and vetted community resources. We vet each resource we add to our resource library using a stringent list of vetting criteria.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/advocacy-resources/advo.git
   ```
2. Navigate into the project directory:
   ```bash
   cd your-directory-name
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Database Setup

This project uses MongoDB Atlas for data storage and MongoDB Atlas Search for advanced search capabilities.

### MongoDB Atlas Search Setup

To enable the search functionality, you need to set up a search index in MongoDB Atlas:

1. Run the setup script to see the required configuration:

   ```bash
   node scripts/setup-atlas-search.js
   ```

2. Follow the instructions provided by the script to create the search index in MongoDB Atlas.

3. Once the index is created, the application will automatically use Atlas Search for resource queries.

## Usage

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

### Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

### Deploy on Linode

We deploy this application on Linode. For deployment instructions, please refer to our internal documentation or contact the development team.

Check out [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more general deployment options.

## Acknowledgments / Contact

Created by the development team at Advocacy Resources, a 501(c)3 organization.

### myAdvo Developers:

Kevin Jones-Eastland
email: kevin@myadvo.org

KaDee Bramlett
email: kadee@myadvo.org

### Development Coaching/Consultation:

Tye Riley
email: tye@myadvo.org

### myAdvo Intern:

Sidi Mohamed
email: sidi@myadvo.org
