import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import PageTransition from "../components/PageTransition";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{
          backgroundColor: 'black',
        }}
      >
        <div className="w-full max-w-md bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-500/20 to-violet-500/20 flex items-center justify-center mb-6">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2.5L14 6.5C14 7.05 14.45 7.5 15 7.5L19 7.5" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M6 13.5V12.9C6 11.0297 6 10.0945 6.43597 9.4453C6.81947 8.87762 7.37762 8.45322 8.0453 8.21675C8.69945 8 9.51292 8 11.1398 8C11.6462 8 11.8994 8 12.1174 8.01666C12.3293 8.03261 12.5139 8.06577 12.6904 8.11391C12.86 8.16 13.0145 8.22462 13.3235 8.35385V8.35385C13.6195 8.47809 13.7675 8.54021 13.8789 8.63C13.9832 8.71405 14.0701 8.81649 14.1353 8.93149C14.2042 9.053 14.2457 9.19648 14.3287 9.48345L14.5 10.0001" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M14.5 14.5L15.5 14.5" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M9 18.5H12" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M13.5 21H8.2C7.07989 21 6.51984 21 6.09202 20.782C5.71569 20.5903 5.40973 20.2843 5.21799 19.908C5 19.4802 5 18.9201 5 17.8V6.2C5 5.07989 5 4.51984 5.21799 4.09202C5.40973 3.71569 5.71569 3.40973 6.09202 3.21799C6.51984 3 7.07989 3 8.2 3H11.4C11.9601 3 12.2401 3 12.5056 3.10899C12.7477 3.20487 12.9667 3.35345 13.1465 3.54254C13.3469 3.75596 13.4869 4.04931 13.7672 4.63602L15.4471 8.20775C15.6038 8.52143 15.6822 8.67827 15.7385 8.84087C15.789 8.98529 15.825 9.13516 15.8465 9.2873C15.8705 9.45552 15.8705 9.62661 15.8705 9.9688V17.8C15.8705 18.9201 15.8705 19.4802 15.6525 19.908C15.4608 20.2843 15.1548 20.5903 14.7785 20.782C14.3507 21 13.7906 21 12.6705 21" stroke="#8b5cf6" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>

            <h1 className="text-3xl font-bold mb-4 text-center bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              Oops! Lost in the fantasy? 🤫
            </h1>

            <p className="text-gray-300 mb-10 text-center">
              Seems like you've wandered into uncharted territory... Let's get you back to the heat! 🔥
            </p>

            <button
              onClick={() => navigate("/")}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-full py-4 font-semibold text-lg shadow-lg shadow-violet-500/25 transition-all duration-300 hover:scale-105"
            >
              <Home size={20} />
              Back to the action
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
