async function resetAllProgress(db, userId) {
    await db.execute(`DELETE FROM user_lesson_progress WHERE user_id = ?`, [userId]);
    await db.execute(`DELETE FROM user_module_progress WHERE user_id = ?`, [userId]);
    await db.execute(`DELETE FROM user_course_progress WHERE user_id = ?`, [userId]);
}

module.exports = { resetAllProgress };
