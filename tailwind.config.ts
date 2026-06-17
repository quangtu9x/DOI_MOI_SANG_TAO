import type { Config } from "tailwindcss";

const config: Config = {
	important: false,
    darkMode: ["class"],
    content: [
	"./src/_metronic/layout/PortalLayout.tsx",
	"!./src/_metronic/layout/DashboardLayout.tsx",
	"./src/_metronic/layout/components/footer/PortalFooter.tsx",
	"./src/_metronic/layout/components/header/PortalHeader.tsx",
	"./src/_metronic/layout/components/header/PortalNavbar.tsx",
    "./src/app/pages/portal/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
		colors: {
			'portal-primary': '#1a4b8c',
			'portal-secondary': '#b60000',
			'header-background': '#f1f2f4',
			'portal-hover': '#0d2d56',
		  },
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
