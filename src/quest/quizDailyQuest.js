'use strict';

function checkQuizAndDaily() {
    if (userDailyStatus.quizAndDailyStatus.isCompleted) {
        return;
    }
    setBadge(new QuizAndDailyBadge(userDailyStatus.quizAndDailyStatus.pointsToGet.toString()));
}
