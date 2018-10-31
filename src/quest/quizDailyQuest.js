'use strict';

function checkQuizAndDaily() {
    if (StatusInst.quizAndDailyStatus.isCompleted) {
        return;
    }
    setBadge(new QuizAndDailyBadge(StatusInst.quizAndDailyStatus.pointsToGet.toString()));

    // notify user by notification if there are more points to grab
    notifyQuizDailyPoints();
}
