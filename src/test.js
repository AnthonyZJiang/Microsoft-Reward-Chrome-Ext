async function pcSearchTest() {
    const status = new DailyRewardStatus();
    const search = new SearchQuest();
    const result = await status.update();
    console.assert(result == STATUS_DONE);
    if (!status.mbSearchStatus.isCompleted) {
        status.mbSearchStatus.progress = status.mbSearchStatus.max;
    }
    status.pcSearchStatus.progress = 0;
    await search.doWork(status);
    console.assert(status.isSearchCompleted);
    console.log('completed');
}

async function mbSearchTest() {
    const status = new DailyRewardStatus();
    const search = new SearchQuest();
    const result = await status.update();
    console.assert(result == STATUS_DONE);
    if (!status.pcSearchStatus.isCompleted) {
        status.pcSearchStatus.progress = status.pcSearchStatus.max;
    }
    status.mbSearchStatus.progress = 0;
    await search.doWork(status);
    console.assert(status.isSearchCompleted);
    console.log('completed');
}

async function completeSearchTest() {
    const status = new DailyRewardStatus();
    const search = new SearchQuest();
    const result = await status.update();
    console.assert(result == STATUS_DONE);
    status.pcSearchStatus.progress = 0;
    status.mbSearchStatus.progress = 0;
    await search.doWork(status);
    console.assert(status.isSearchCompleted);
    console.log('completed');
}
