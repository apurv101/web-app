# Aimyable Web App

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

It has been configured to build a static site and output it to the `assets/dist` folder so it can be used with AWS CloudFront.
For details on how this is configured and limitations this comes with, see [Next.js static exports](https://nextjs.org/docs/app/building-your-application/deploying/static-exports).
The primary limitation to be aware of is that the Next.js server features do not work.

The pipeline in this repo simply triggers `root-cdk`, which deploys this site to AWS.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The home page is `app/page.tsx`. The page auto-updates as you edit any files.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
