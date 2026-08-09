// src/pages/LeaderboardPage.jsx
import React, { useState, useEffect } from "react";
import { ArrowLeft, Star, Trophy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getLeaderboard } from "../Services/leaderboard";
import Confetti from "react-confetti";


export default function LeaderboardPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("orders"); // "orders" | "ratings"
  const [leaders, setLeaders] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
  const timer = setTimeout(() => {
    setShowConfetti(false);
  }, 3000);

  return () => clearTimeout(timer);
}, []);

  // ---------------- LOAD LEADERBOARD DATA ----------------
useEffect(() => {
  const fetchLeaderboard = async () => {
    try {
      const res = await getLeaderboard();

      console.log("Leaderboard API ✅", res);

      const list = res.data || [];

     const formatted = list.map((item, index) => ({
      id: item.id,
      name: item.full_name,
      completed: item.total_orders,
      rating: 0, // ❗ no rating in API
      isCurrent: item.id === 10, // 👈 match your user id
    }));

      setLeaders(formatted);

      const current =
      formatted.find((u) => u.isCurrent) || {
        id: 10,
        name: "You",
        completed: 0,
        rating: 0,
        isCurrent: true,
      };

    setCurrentUser(current);
      if (current) setCurrentUser(current);

    } catch (err) {
      console.error("Leaderboard API error ❌", err);
    } finally {
      setLoading(false);
    }
  };

  fetchLeaderboard();
}, []);

  // ---------------- SORT DATA ----------------
  const sortedByOrders = [...leaders].sort((a, b) => b.completed - a.completed);
//   const sortedByRating = [...leaders].sort(
//   (a, b) => Number(b.rating) - Number(a.rating)
// );

  const top100Orders = sortedByOrders.slice(0, 100);
  // const top100Ratings = sortedByRating.slice(0, 100);

  // Find current user rank
  const userOrdersRank =
  sortedByOrders.findIndex((x) => x.isCurrent) + 1 || sortedByOrders.length + 1;

  // const userRatingsRank =
  // sortedByRating.findIndex((x) => x.isCurrent) + 1;


  const renderRankMedal = (rank) => {
    if (rank === 1)
      return <Trophy className="text-yellow-400 w-5 h-5" />;
    if (rank === 2)
      return <Trophy className="text-gray-400 w-5 h-5" />;
    if (rank === 3)
      return <Trophy className="text-orange-600 w-5 h-5" />;
    return rank;
  };

  const renderRow = (leader, index, type) => (
    <tr key={leader.id} className={index % 2 === 0 ? "bg-orange-50" : "bg-white"}>
      <td className="p-3 font-semibold text-center">
        {renderRankMedal(index + 1)}
      </td>
      <td className="p-3">{leader.name}</td>

      {type === "orders" ? (
        <td className="p-3 text-center">{leader.completed}</td>
      ) : (
        <td className="p-3 text-center flex items-center gap-1 justify-center">
          {leader.rating} <Star className="text-yellow-400 w-4 h-4" />
        </td>
      )}
    </tr>
  );

  if (loading) {
  return (
    <div className="h-screen flex items-center justify-center">
      Loading leaderboard...
    </div>
  );
}

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col">
    
      {showConfetti && (
      <Confetti
        numberOfPieces={200}
        recycle={false}
      />
    )}
    
      {/* HEADER */}
      <header className="bg-orange-500 text-white py-4 px-6 shadow-lg relative text-center">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 bg-white text-orange-500 p-2 rounded-full shadow"
        >
          <ArrowLeft size={20} />
        </button>
       
     <h1 className="text-xl font-bold">Leaderboard</h1>
      <p className="text-xs opacity-80">
        Top delivery partners
      </p>
      </header>


      {/* TABS */}
      <div className="flex justify-center mt-4">
        <button
          className={`px-4 py-2 rounded-l-xl font-semibold ${
            activeTab === "orders"
              ? "bg-orange-500 text-white"
              : "bg-white text-gray-600"
          }`}
          onClick={() => setActiveTab("orders")}
        >
          Completed Orders
        </button>
       <button
  className="px-4 py-2 rounded-r-xl font-semibold bg-gray-200 text-gray-400 cursor-not-allowed relative"
  disabled
>
  Ratings

  {/* Coming Soon badge */}
  <span className="absolute -top-2 -right-2 text-[10px] bg-orange-500 text-white px-2 py-[2px] rounded-full">
    Soon
  </span>
</button>
      </div>

      {/* TABLE */}
      <div className="p-6 max-w-4xl mx-auto w-full space-y-4">
        <div className="bg-white rounded-2xl shadow overflow-hidden">
         <div className="px-4 mt-4 space-y-4">

  {/* 🥇 TOP 3 */}
  <div className="grid grid-cols-3 gap-3 text-center">
    {top100Orders.slice(0, 3).map((user, index) => (
      <div
        key={user.id}
        className={`p-3 rounded-xl shadow ${
          index === 0
            ? "bg-yellow-100"
            : index === 1
            ? "bg-gray-100"
            : "bg-orange-100"
        }`}
      >
        <div className="text-lg font-bold">#{index + 1}</div>
        <div className="text-sm font-semibold truncate">
          {user.name}
        </div>
        <div className="text-xs text-gray-600">
          {user.completed} orders
        </div>
      </div>
    ))}
  </div>

  {/* 📋 REST LIST */}
  <div className="bg-white rounded-xl shadow divide-y">
    {top100Orders.slice(3).map((user, index) => {
      const rank = index + 4;

      return (
        <div
          key={user.id}
          className="flex justify-between items-center px-4 py-3"
        >
          <span className="font-semibold text-gray-600">
            #{rank}
          </span>

          <span className="flex-1 ml-3">
            {user.name}
          </span>

          <span className="font-semibold">
            {user.completed}
          </span>
        </div>
      );
    })}
  </div>
</div>
        </div>

        {/* USER RANK BELOW TOP 100 */}
        {(activeTab === "orders"
          ? userOrdersRank > 100
          : userRatingsRank > 100) && (
          <div className="bg-white p-4 rounded-2xl shadow">
            <h2 className="font-bold text-lg mb-2">Your Rank</h2>

            <div className="flex justify-between text-sm">
              <span>Rank</span>
              <span className="font-bold">
                {activeTab === "orders" ? userOrdersRank : userRatingsRank}
              </span>
            </div>

            <div className="flex justify-between text-sm mt-1">
              <span>{currentUser?.name}</span>
              <span className="font-bold">
                {activeTab === "orders"
                  ? currentUser?.completed
                  : currentUser?.rating}
              </span>
            </div>
          </div>
        )}
      </div>
     
      
      {/* 🔥 FIXED USER RANK BAR */}

      {/* 🔥 FIXED USER RANK BAR */}
      

    </div>
  );
}
