package com.foutaerp.shared.database

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters

// Base de données locale pour mode hors ligne
@Database(
    entities = [
        OfflineAction::class,
        CachedData::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class LocalDatabase : RoomDatabase() {
    abstract fun offlineActionDao(): OfflineActionDao
    abstract fun cachedDataDao(): CachedDataDao
}

// Entités
@Entity(tableName = "offline_actions")
data class OfflineAction(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val action: String,
    val endpoint: String,
    val data: String,
    val timestamp: Long,
    val synced: Boolean = false
)

@Entity(tableName = "cached_data")
data class CachedData(
    @PrimaryKey
    val key: String,
    val data: String,
    val timestamp: Long
)

