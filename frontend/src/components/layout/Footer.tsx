export default function Footer() {
  return (
    <footer className="bg-blue-800 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8">
          <div className="flex items-center mb-6 md:mb-0">
            <img src="/iiit-manipur-logo.png" alt="IIIT Manipur Logo" className="h-12 w-12 mr-4" />
            <div>
              <h3 className="text-lg font-semibold mb-1">IIIT Manipur</h3>
              <p className="text-blue-200 text-sm">Smart Attendance System</p>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Communication Address</h3>
            <address className="not-italic text-blue-200 text-sm leading-relaxed">
              Indian Institute of Information Technology Manipur<br />
              City-Campus, Mantripukhri<br />
              Imphal, Manipur, India - 795002<br />
              Email: <a href="mailto:director@iiitmanipur.ac.in" className="underline hover:text-white">director@iiitmanipur.ac.in</a>
            </address>
          </div>
          <div className="flex flex-col justify-between">
            <div className="mb-2">
              <span className="block text-blue-200 text-xs">2015-2025 © IIIT Senapati, Manipur</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
