import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Room Studio — Bedroom 1203',description:'A precise, interactive 3D bedroom planner. Arrange furniture, compare dimensions and test chair movement.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
