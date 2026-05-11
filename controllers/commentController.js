import db from '../database/database.js';

// Get all comments and replies for an event
export const getCommentsByEventId = async (req, res) => {
  const { eventId } = req.params;

  try {
    const query = `
      SELECT 
        c.id,
        c.event_id,
        c.user_id,
        c.parent_id,
        c.content,
        c.created_at,
        CONCAT(u.firstname, ' ', u.lastname) as name,
        u.profile_image,
        r.role_name
      FROM comment c
      JOIN user u ON c.user_id = u.user_id
      JOIN role r ON u.role_id = r.role_id
      WHERE c.event_id = ?
      ORDER BY c.created_at ASC
    `;

    const [comments] = await db.query(query, [eventId]);
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error fetching comments', error: error.message });
  }
};

// Create a new comment or reply
export const createComment = async (req, res) => {
  const { event_id, parent_id, content } = req.body;
  const user_id = req.user.id; // Get from JWT token

  // Validation
  if (!event_id || !content) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Check if event exists
    const [event] = await db.query('SELECT event_id FROM event WHERE event_id = ?', [event_id]);
    if (event.length === 0) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if user exists
    const [user] = await db.query('SELECT user_id FROM user WHERE user_id = ?', [user_id]);
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If parent_id is provided, check if parent comment exists
    if (parent_id) {
      const [parentComment] = await db.query('SELECT id FROM comment WHERE id = ? AND event_id = ?', [parent_id, event_id]);
      if (parentComment.length === 0) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }

    // Insert the comment
    const insertQuery = `
      INSERT INTO comment (event_id, user_id, parent_id, content)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(insertQuery, [event_id, user_id, parent_id || null, content]);

    // Fetch the newly created comment with user info
    const [newComment] = await db.query(`
      SELECT 
        c.id,
        c.event_id,
        c.user_id,
        c.parent_id,
        c.content,
        c.created_at,
        CONCAT(u.firstname, ' ', u.lastname) as name,
        u.profile_image,
        r.role_name
      FROM comment c
      JOIN user u ON c.user_id = u.user_id
      JOIN role r ON u.role_id = r.role_id
      WHERE c.id = ?
    `, [result.insertId]);

    res.status(201).json({
      message: 'Comment created successfully',
      comment: newComment[0]
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Error creating comment', error: error.message });
  }
};

// Delete a comment (only by the comment owner or admin)
export const deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const user_id = req.user.id;
  const role_id = req.user.role_id;

  try {
    // Get the comment
    const [comment] = await db.query('SELECT user_id FROM comment WHERE id = ?', [commentId]);
    if (comment.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check authorization (owner or admin)
    if (comment[0].user_id !== user_id && role_id !== 3) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Delete the comment (CASCADE will handle child comments)
    await db.query('DELETE FROM comment WHERE id = ?', [commentId]);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Error deleting comment', error: error.message });
  }
};

// Update a comment (only by the comment owner)
export const updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const user_id = req.user.id;

  if (!content) {
    return res.status(400).json({ message: 'Content is required' });
  }

  try {
    // Get the comment
    const [comment] = await db.query('SELECT user_id FROM comment WHERE id = ?', [commentId]);
    if (comment.length === 0) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check authorization (owner only)
    if (comment[0].user_id !== user_id) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    // Update the comment
    await db.query('UPDATE comment SET content = ? WHERE id = ?', [content, commentId]);

    // Fetch and return updated comment
    const [updatedComment] = await db.query(`
      SELECT 
        c.id,
        c.event_id,
        c.user_id,
        c.parent_id,
        c.content,
        c.created_at,
        CONCAT(u.firstname, ' ', u.lastname) as name,
        u.profile_image,
        r.role_name
      FROM comment c
      JOIN user u ON c.user_id = u.user_id
      JOIN role r ON u.role_id = r.role_id
      WHERE c.id = ?
    `, [commentId]);

    res.json({
      message: 'Comment updated successfully',
      comment: updatedComment[0]
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Error updating comment', error: error.message });
  }
};
