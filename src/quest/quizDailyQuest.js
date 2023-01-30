'use strict';

import {setBadge, QuizAndDailyBadge} from '../badge.js';
import {userDailyStatus} from '../background.js';

export function checkQuizAndDaily() {
    if (userDailyStatus.quizAndDailyStatus.isCompleted) {
        return;
    }
    setBadge(new QuizAndDailyBadge(userDailyStatus.quizAndDailyStatus.pointsToGet.toString()));
}
