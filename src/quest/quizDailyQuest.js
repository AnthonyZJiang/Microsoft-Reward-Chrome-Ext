'use strict';

function checkQuizAndDaily() {
    if (StatusInst.quizAndDailyStatus.isCompleted) {
        return;
    }
    setBadge(new QuizAndDailyBadge());
    
    // notify user by notification if there are more points to grab
    notifyQuizDailyPoints();
}