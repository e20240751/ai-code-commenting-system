import React, { useState, useEffect } from "react";
import {
  Trophy,
  Crown,
  Star,
  Medal,
  Award,
  TrendingUp,
  Users,
  Target,
} from "lucide-react";
import { useUser } from "../context/UserContext";

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("global");
  const [timeframe, setTimeframe] = useState("all");
  const { user, points, rank, completedExercises, isAuthenticated } = useUser();
  const userName = isAuthenticated ? user?.username : "Guest User";

  // Mock leaderboard data - replace with actual API calls
  const [leaderboardData, setLeaderboardData] = useState({
    global: [
      {
        id: 1,
        name: "Alex Johnson",
        rank: "legend",
        points: 1250,
        avatar: "👑",
        completedExercises: 45,
      },
      {
        id: 2,
        name: "Sarah Chen",
        rank: "legend",
        points: 1180,
        avatar: "🌟",
        completedExercises: 42,
      },
      {
        id: 3,
        name: "Mike Rodriguez",
        rank: "epic",
        points: 980,
        avatar: "🚀",
        completedExercises: 38,
      },
      {
        id: 4,
        name: "Emily Davis",
        rank: "epic",
        points: 920,
        avatar: "💎",
        completedExercises: 36,
      },
      {
        id: 5,
        name: "David Kim",
        rank: "advance",
        points: 780,
        avatar: "⭐",
        completedExercises: 32,
      },
      {
        id: 6,
        name: "Lisa Wang",
        rank: "advance",
        points: 720,
        avatar: "🎯",
        completedExercises: 28,
      },
      {
        id: 7,
        name: "Tom Wilson",
        rank: "expert",
        points: 580,
        avatar: "🔥",
        completedExercises: 24,
      },
      {
        id: 8,
        name: "Anna Brown",
        rank: "expert",
        points: 520,
        avatar: "⚡",
        completedExercises: 22,
      },
      {
        id: 9,
        name: "Chris Lee",
        rank: "beginner",
        points: 180,
        avatar: "🌱",
        completedExercises: 8,
      },
      {
        id: 10,
        name: userName,
        rank: rank,
        points: points,
        avatar: "👤",
        completedExercises: completedExercises.length,
      },
    ],
    weekly: [
      {
        id: 1,
        name: "Sarah Chen",
        rank: "legend",
        points: 180,
        avatar: "🌟",
        completedExercises: 8,
      },
      {
        id: 2,
        name: "Mike Rodriguez",
        rank: "epic",
        points: 160,
        avatar: "🚀",
        completedExercises: 7,
      },
      {
        id: 3,
        name: "Alex Johnson",
        rank: "legend",
        points: 140,
        avatar: "👑",
        completedExercises: 6,
      },
      {
        id: 4,
        name: "Emily Davis",
        rank: "epic",
        points: 120,
        avatar: "💎",
        completedExercises: 5,
      },
      {
        id: 5,
        name: userName,
        rank: rank,
        points: points,
        avatar: "👤",
        completedExercises: completedExercises.length,
      },
    ],
    monthly: [
      {
        id: 1,
        name: "Alex Johnson",
        rank: "legend",
        points: 680,
        avatar: "👑",
        completedExercises: 28,
      },
      {
        id: 2,
        name: "Sarah Chen",
        rank: "legend",
        points: 620,
        avatar: "🌟",
        completedExercises: 25,
      },
      {
        id: 3,
        name: "Mike Rodriguez",
        rank: "epic",
        points: 580,
        avatar: "🚀",
        completedExercises: 23,
      },
      {
        id: 4,
        name: "Emily Davis",
        rank: "epic",
        points: 540,
        avatar: "💎",
        completedExercises: 22,
      },
      {
        id: 5,
        name: "David Kim",
        rank: "advance",
        points: 480,
        avatar: "⭐",
        completedExercises: 19,
      },
    ],
  });

  const getRankInfo = (rank) => {
    const ranks = {
      legend: {
        name: "Legend",
        color: "from-yellow-400 to-yellow-600",
        icon: Crown,
        minPoints: 1000,
      },
      epic: {
        name: "Epic",
        color: "from-purple-500 to-purple-700",
        icon: Star,
        minPoints: 800,
      },
      advance: {
        name: "Advance",
        color: "from-blue-500 to-blue-700",
        icon: Trophy,
        minPoints: 600,
      },
      expert: {
        name: "Expert",
        color: "from-green-500 to-green-700",
        icon: Medal,
        minPoints: 300,
      },
      beginner: {
        name: "Beginner",
        color: "from-gray-400 to-gray-600",
        icon: Award,
        minPoints: 0,
      },
    };
    return ranks[rank] || ranks.beginner;
  };

  const getRankIcon = (rank) => {
    const rankInfo = getRankInfo(rank);
    const Icon = rankInfo.icon;
    return <Icon className="h-5 w-5" />;
  };

  const getRankColor = (rank) => {
    return getRankInfo(rank).color;
  };

  const getPositionIcon = (position) => {
    switch (position) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-600" />;
      default:
        return <span className="text-gray-500 font-bold">#{position}</span>;
    }
  };

  const getCurrentUserPosition = () => {
    const data = leaderboardData[activeTab];
    const userIndex = data.findIndex((user) => user.name === userName);
    return userIndex !== -1 ? userIndex + 1 : null;
  };

  const getNextRankInfo = () => {
    const currentRankInfo = getRankInfo(rank);
    const ranks = ["beginner", "expert", "advance", "epic", "legend"];
    const currentIndex = ranks.indexOf(rank);

    if (currentIndex < ranks.length - 1) {
      const nextRank = ranks[currentIndex + 1];
      const nextRankInfo = getRankInfo(nextRank);
      const pointsNeeded = nextRankInfo.minPoints - points;
      return { ...nextRankInfo, rank: nextRank, pointsNeeded };
    }
    return null;
  };

  const currentData = leaderboardData[activeTab];
  const userPosition = getCurrentUserPosition();
  const nextRank = getNextRankInfo();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Leaderboard & Ranking
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compete with other learners and track your progress through our
            ranking system
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Stats Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Your Progress
              </h3>

              <div className="text-center mb-6">
                <div
                  className={`w-20 h-20 bg-gradient-to-r ${getRankColor(
                    rank
                  )} rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  {getRankIcon(rank)}
                </div>
                <div
                  className={`text-lg font-bold bg-gradient-to-r ${getRankColor(
                    rank
                  )} bg-clip-text text-transparent`}
                >
                  {getRankInfo(rank).name}
                </div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  {points} Points
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Exercises Completed</span>
                  <span className="font-semibold">
                    {completedExercises.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Position</span>
                  <span className="font-semibold">
                    {userPosition ? `#${userPosition}` : "Unranked"}
                  </span>
                </div>
              </div>

              {nextRank && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Target className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">
                      Next Rank
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800">{nextRank.name}</span>
                    <span className="text-blue-600 font-semibold">
                      {nextRank.pointsNeeded} pts
                    </span>
                  </div>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (points / nextRank.minPoints) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Rank Requirements */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Rank Requirements
              </h3>
              <div className="space-y-3">
                {["beginner", "expert", "advance", "epic", "legend"].map(
                  (rankKey) => {
                    const rankInfo = getRankInfo(rankKey);
                    const Icon = rankInfo.icon;
                    const isCurrentRank = rank === rankKey;
                    const isAchieved = points >= rankInfo.minPoints;

                    return (
                      <div
                        key={rankKey}
                        className={`flex items-center p-3 rounded-lg ${
                          isCurrentRank
                            ? "bg-primary-50 border-2 border-primary-200"
                            : "bg-gray-50"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 bg-gradient-to-r ${rankInfo.color} rounded-full flex items-center justify-center mr-3`}
                        >
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {rankInfo.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {rankInfo.minPoints} points
                          </div>
                        </div>
                        {isAchieved && (
                          <div className="text-green-500">
                            <svg
                              className="h-5 w-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {[
                  { key: "global", label: "Global" },
                  { key: "weekly", label: "This Week" },
                  { key: "monthly", label: "This Month" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      activeTab === tab.key
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Leaderboard List */}
              <div className="space-y-3">
                {currentData.map((user, index) => {
                  const position = index + 1;
                  const isCurrentUser = user.name === userName;

                  return (
                    <div
                      key={user.id}
                      className={`flex items-center p-4 rounded-lg border-2 transition-all duration-200 ${
                        isCurrentUser
                          ? "border-primary-200 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 mr-4">
                        {getPositionIcon(position)}
                      </div>

                      <div className="text-2xl mr-4">{user.avatar}</div>

                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4
                            className={`font-semibold ${
                              isCurrentUser
                                ? "text-primary-900"
                                : "text-gray-900"
                            }`}
                          >
                            {user.name}
                          </h4>
                          {isCurrentUser && (
                            <span className="ml-2 text-xs bg-primary-200 text-primary-800 px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <div className="flex items-center mt-1">
                          <div
                            className={`w-6 h-6 bg-gradient-to-r ${getRankColor(
                              user.rank
                            )} rounded-full flex items-center justify-center mr-2`}
                          >
                            {getRankIcon(user.rank)}
                          </div>
                          <span className="text-sm text-gray-600">
                            {getRankInfo(user.rank).name}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          {user.points}
                        </div>
                        <div className="text-sm text-gray-600">points</div>
                      </div>

                      <div className="text-right ml-6">
                        <div className="font-semibold text-gray-900">
                          {user.completedExercises}
                        </div>
                        <div className="text-sm text-gray-600">exercises</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {currentData.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No data available for this period.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Achievement Section */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">
            Recent Achievements
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center p-4 bg-green-50 rounded-lg">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-green-900">
                  First Quiz Completed
                </div>
                <div className="text-sm text-green-700">
                  Completed your first exercise
                </div>
              </div>
            </div>

            <div className="flex items-center p-4 bg-blue-50 rounded-lg">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-blue-900">
                  Code Explainer
                </div>
                <div className="text-sm text-blue-700">
                  Used Smart Explanation feature
                </div>
              </div>
            </div>

            <div className="flex items-center p-4 bg-purple-50 rounded-lg">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-semibold text-purple-900">Rising Star</div>
                <div className="text-sm text-purple-700">
                  Earned your first 100 points
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
