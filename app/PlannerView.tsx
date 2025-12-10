import React, { useState, useEffect } from 'react';
import { Icon } from '../components/atoms/Icon/icons';
import { useApi } from '../hooks/useApi';
import { plannerService, ScheduledPost, GetPostsParams } from '../services/plannerService';
import { authService } from '@/services/authService';

const PostDetailModal = ({ post, onClose, onDelete }: { post: ScheduledPost, onClose: () => void, onDelete: (id: number) => void }) => {
    const platformIconMap = {
        Facebook: "facebook",
        Instagram: "instagram",
        LinkedIn: "linkedin",
        Generic: "chat"
    };

    return (
        <div className="post-detail-modal-overlay" onClick={onClose}>
            <div className="post-detail-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="platform-info">
                        <Icon name={platformIconMap[post.platform]} />
                        <h3>{post.platform} Post</h3>
                    </div>
                    <button className="icon-button" onClick={onClose} title="Close">
                        <Icon name="close" />
                    </button>
                </div>
                <div className="modal-content">
                    {post.fullPicture && <img src={post.fullPicture} alt="Post attachment" className="modal-image-preview" />}
                    <h4 className="modal-post-title">{post.title}</h4>
                    <p className="modal-post-content">{post.content}</p>
                    <div className="modal-post-details">
                        <div className="detail-item">
                            <span>Scheduled for</span>
                            <strong>{new Date(post.date + 'T00:00:00').toLocaleDateString('default', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
                        </div>
                        <div className="detail-item">
                             <span>Status</span>
                            <span className={`status-indicator ${post.status.toLowerCase()}`}>{post.status}</span>
                        </div>
                    </div>
                </div>
                <div className="modal-actions">
                    <button 
                        className="delete-button" 
                        disabled={post.status === 'Posted'} 
                        onClick={() => onDelete(post.id)}
                        title={post.status === 'Posted' ? 'Cannot delete a post that has already been published.' : 'Delete this post'}
                    >
                        <Icon name="trash2" />
                        Delete Post
                    </button>
                </div>
            </div>
        </div>
    )
}

export const PlannerView = () => {
    const [currentDate, setCurrentDate] = useState(new Date()); 
    const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');
    const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
    const [platformFilter, setPlatformFilter] = useState<string>('All');
    
    const { data, loading, error, execute } = useApi<{ posts: ScheduledPost[];}>();
    const posts = data?.posts || [];

    // Calculate date range based on view mode
    const getDateRange = () => {
        let startDate: Date;
        let endDate: Date;

        if (viewMode === 'month') {
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        } else if (viewMode === 'week') {
            startDate = new Date(currentDate);
            startDate.setDate(currentDate.getDate() - currentDate.getDay());
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
        } else {
            // List view - upcoming posts
            startDate = new Date();
            endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 3); // Next 3 months
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    };

    // Fetch posts from API
    const fetchPosts = () => {
        const { startDate, endDate } = getDateRange();
        const params: GetPostsParams = {
            startDate,
            endDate,
            platform: platformFilter !== 'All' ? platformFilter : undefined,
        };

        execute(() => plannerService.getPosts(params));
    };

    // Fetch posts when filters or date changes
    useEffect(() => {
        fetchPosts();
    }, [currentDate, viewMode, platformFilter]);

    const handlePrev = () => {
        if (viewMode === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        } else if (viewMode === 'week') {
            setCurrentDate(new Date(currentDate.getTime() - (7 * 24 * 60 * 60 * 1000)));
        }
    };

    const handleNext = () => {
        if (viewMode === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        } else if (viewMode === 'week') {
            setCurrentDate(new Date(currentDate.getTime() + (7 * 24 * 60 * 60 * 1000)));
        }
    };
    
    const handleDeletePost = async (postId: number) => {
        if (window.confirm('Are you sure you want to delete this scheduled post? This action cannot be undone.')) {
            try {
                await plannerService.deletePost(postId);
                setSelectedPost(null);
                // Refresh posts list
                fetchPosts();
            } catch (error) {
                console.error('Delete post error:', error);
                alert('Không thể xóa bài viết. Vui lòng thử lại.');
            }
        }
    };

    const getPostsForDay = (date: Date) => {
        const dateString = date.toLocaleDateString("en-CA", { timeZone: "Asia/Ho_Chi_Minh" });
        return posts.filter(post => post.date === dateString);
    };
    
    const renderMonthView = () => {
        const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const startDate = new Date(startOfMonth);
        startDate.setDate(startDate.getDate() - startOfMonth.getDay());
        const endDate = new Date(endOfMonth);
        endDate.setDate(endDate.getDate() + (6 - endOfMonth.getDay()));

        const days = [];
        let day = new Date(startDate);
        while (day <= endDate) {
            days.push(new Date(day));
            day.setDate(day.getDate() + 1);
        }
        
        const isToday = (date: Date) => {
            const today = new Date();
            return date.getDate() === today.getDate() &&
                   date.getMonth() === today.getMonth() &&
                   date.getFullYear() === today.getFullYear();
        };
        
        return (
            <div className="calendar-grid month-view">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
                    <div key={dayName} className="day-name">{dayName}</div>
                ))}
                {days.map((d, index) => (
                    <div key={index} className={`calendar-day ${d.getMonth() !== currentDate.getMonth() ? 'other-month' : ''}`}>
                        <span className={`day-number ${isToday(d) ? 'today' : ''}`}>{d.getDate()}</span>
                        <div className="posts-container">
                            {getPostsForDay(d).map(post => (
                                <div key={post.id} className="calendar-post" onClick={() => setSelectedPost(post)}>
                                    <span className={`post-dot ${post.platform.toLowerCase()}`}></span>
                                    {post.content.substring(0, 10)}...
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderWeekView = () => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        
        const weekDays = Array.from({ length: 7 }).map((_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            return day;
        });
        
        const isToday = (date: Date) => {
            const today = new Date();
            return date.getDate() === today.getDate() &&
                   date.getMonth() === today.getMonth() &&
                   date.getFullYear() === today.getFullYear();
        };

        return (
             <div className="calendar-grid week-view">
                {weekDays.map(day => (
                    <div key={day.toISOString()} className="day-name">{day.toLocaleDateString('default', { weekday: 'short' })}</div>
                ))}
                {weekDays.map(day => (
                    <div key={day.toISOString()} className="calendar-day">
                         <span className={`day-number ${isToday(day) ? 'today' : ''}`}>{day.getDate()}</span>
                         <div className="posts-container">
                            {getPostsForDay(day).map(post => (
                                <div key={post.id} className="calendar-post" onClick={() => setSelectedPost(post)}>
                                    <span className={`post-dot ${post.platform.toLowerCase()}`}></span>
                                    {post.content.substring(0, 10)}...
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )
    };

    const renderListView = () => {
        const upcomingPosts = posts
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const groupedPosts = upcomingPosts.reduce((acc, post) => {
            const date = post.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(post);
            return acc;
        }, {} as Record<string, ScheduledPost[]>);

        return (
            <div className="list-view-container">
                {Object.keys(groupedPosts).length > 0 ? Object.entries(groupedPosts).map(([date, postsInGroup]: [string, ScheduledPost[]]) => (
                    <div key={date} className="list-item-group">
                        <h3>{new Date(date + 'T00:00:00').toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</h3>
                        {postsInGroup.map(post => (
                            <div key={post.id} className="list-item" onClick={() => setSelectedPost(post)}>
                                <span className={`post-dot ${post.platform.toLowerCase()}`}></span>
                                <div className="list-item-content">
                                    <p className="list-item-title">{post.content.substring(0, 50)}...</p>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                        <p className="list-item-platform">{post.platform}</p>
                                        <span className={`status-indicator ${post.status.toLowerCase()}`}>{post.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )) : <div className="placeholder-view"><p>No upcoming posts scheduled.</p></div>}
            </div>
        )
    };
    
    const getHeaderTitle = () => {
        if (viewMode === 'month') {
            return currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
        }
        if (viewMode === 'week') {
             const startOfWeek = new Date(currentDate);
             startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
             const endOfWeek = new Date(startOfWeek);
             endOfWeek.setDate(startOfWeek.getDate() + 6);
             return `${startOfWeek.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        }
        return 'All Scheduled Posts';
    };

    return (
        <>
            <div className="planner-container">
                <header className="planner-header">
                    <div className="planner-nav">
                        <button className="icon-button" onClick={handlePrev} title="Previous" disabled={viewMode === 'list'}>
                            <Icon name="chevronLeft" />
                        </button>
                        <h2>{getHeaderTitle()}</h2>
                        <button className="icon-button" onClick={handleNext} title="Next" disabled={viewMode === 'list'}>
                             <Icon name="chevronRight" />
                        </button>
                    </div>
                    <div className="planner-controls">
                        <div className="platform-filter">
                            <Icon name="filter" />
                            <select 
                                value={platformFilter} 
                                onChange={(e) => setPlatformFilter(e.target.value)}
                                className="filter-select"
                            >
                                <option value="All">Tất cả</option>
                                <option value="facebook">Facebook</option>
                                <option value="instagram">Instagram</option>
                            </select>
                        </div>
                        <div className="view-toggle-buttons">
                            <button className={`toggle-button ${viewMode === 'month' ? 'active' : ''}`} onClick={() => setViewMode('month')}>Month</button>
                            <button className={`toggle-button ${viewMode === 'week' ? 'active' : ''}`} onClick={() => setViewMode('week')}>Week</button>
                            <button className={`toggle-button ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>List</button>
                        </div>
                    </div>
                </header>
                <div className="planner-content">
                    {loading && (
                        <div className="planner-loading">
                            <div className="spinner"></div>
                            <p>Đang tải dữ liệu...</p>
                        </div>
                    )}
                    {error && (
                        <div className="planner-error">
                            <Icon name="alertCircle" />
                            <p>{error}</p>
                            <button onClick={fetchPosts} className="retry-button">Thử lại</button>
                        </div>
                    )}
                    {!loading && !error && (
                        <>
                            {viewMode === 'month' && renderMonthView()}
                            {viewMode === 'week' && renderWeekView()}
                            {viewMode === 'list' && renderListView()}
                        </>
                    )}
                </div>
            </div>
            {selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} onDelete={handleDeletePost} />}
        </>
    );
};