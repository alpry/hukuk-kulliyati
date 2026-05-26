import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hukuk Külliyatı",
  description: "Türk hukuku mevzuatı ve kişisel notlar",
};

// İlk render'da koyu tema/font için class'ları erkenden ekle (FOUC engel)
const themeBootstrap = `
(function(){
  try {
    var m = document.cookie.match(/(?:^|; )hk_theme=(light|dark)/);
    var f = document.cookie.match(/(?:^|; )hk_font=(sm|md|lg)/);
    var html = document.documentElement;
    if (m && m[1] === 'dark') html.classList.add('dark');
    html.classList.add('font-' + (f ? f[1] : 'md'));
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="min-h-screen" suppressHydrationWarning>{children}</body>
    </html>
  );
}
