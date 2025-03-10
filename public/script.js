document.addEventListener('DOMContentLoaded', () => {
    const postForm = document.getElementById('postForm');
    const loading = document.getElementById('loading');
    const resultContainer = document.getElementById('resultContainer');
    const postContent = document.getElementById('postContent');
    const commentContainer = document.getElementById('commentContainer');
    const commentContent = document.getElementById('commentContent');
    const copyPost = document.getElementById('copyPost');
    const copyComment = document.getElementById('copyComment');
    const postGoal = document.getElementById('postGoal');
    const ctaLinkContainer = document.getElementById('ctaLinkContainer');
    const savePostBtn = document.getElementById('savePostBtn');
    const historyContainer = document.getElementById('historyContainer');
    const postHistory = document.getElementById('postHistory');
    
    // Load post history from localStorage
    let savedPosts = JSON.parse(localStorage.getItem('fbPostHistory')) || [];
    updateHistoryDisplay();


    // Show/hide CTA link field based on post goal selection
    postGoal.addEventListener('change', () => {
        if (postGoal.value === 'link') {
            ctaLinkContainer.style.display = 'block';
        } else {
            ctaLinkContainer.style.display = 'none';
        }
    });

    // Initial check for CTA link visibility
    if (postGoal.value === 'link') {
        ctaLinkContainer.style.display = 'block';
    } else {
        ctaLinkContainer.style.display = 'none';
    }

    // Handle form submission
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const topic = document.getElementById('topic').value;
        const writeStyle = document.getElementById('writeStyle').value;
        const postGoalValue = postGoal.value;
        const ctaLink = document.getElementById('ctaLink').value;
        const contentLength = document.getElementById('contentLength').value;
        
        // Show loading indicator
        loading.style.display = 'block';
        resultContainer.style.display = 'none';
        
        try {
            const response = await fetch('/api/generate-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    topic,
                    writeStyle,
                    postGoal: postGoalValue,
                    ctaLink,
                    contentLength
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Display the generated post
                postContent.innerHTML = formatContent(data.postContent);
                
                // Handle comment display if available
                if (data.commentContent && postGoalValue === 'link') {
                    commentContent.innerHTML = formatContent(data.commentContent);
                    commentContainer.style.display = 'block';
                } else {
                    commentContainer.style.display = 'none';
                }
                
                resultContainer.style.display = 'block';
            } else {
                alert('Error: ' + data.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while generating the post. Please try again.');
        } finally {
            loading.style.display = 'none';
        }
    });

    // Copy post content to clipboard
    copyPost.addEventListener('click', () => {
        copyToClipboard(postContent.innerText);
        copyPost.textContent = 'Copied!';
        setTimeout(() => {
            copyPost.textContent = 'Copy';
        }, 2000);
    });

    // Copy comment content to clipboard
    copyComment.addEventListener('click', () => {
        copyToClipboard(commentContent.innerText);
        copyComment.textContent = 'Copied!';
        setTimeout(() => {
            copyComment.textContent = 'Copy';
        }, 2000);
    });

    // Format content by preserving line breaks
    function formatContent(text) {
        return text.replace(/\n/g, '<br>');
    }

    // Copy text to clipboard
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('Text copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    }
    
    // Save current post to history
    savePostBtn.addEventListener('click', () => {
        const topic = document.getElementById('topic').value;
        const post = postContent.innerText;
        const comment = commentContainer.style.display !== 'none' ? commentContent.innerText : '';
        const timestamp = new Date().toLocaleString();
        
        const savedPost = {
            id: Date.now(),
            topic,
            post,
            comment,
            timestamp
        };
        
        // Add to beginning of array
        savedPosts.unshift(savedPost);
        
        // Keep only the latest 10 posts
        if (savedPosts.length > 10) {
            savedPosts = savedPosts.slice(0, 10);
        }
        
        // Save to localStorage
        localStorage.setItem('fbPostHistory', JSON.stringify(savedPosts));
        
        // Update the history display
        updateHistoryDisplay();
        
        // Show feedback
        savePostBtn.textContent = 'Saved!';
        savePostBtn.disabled = true;
        setTimeout(() => {
            savePostBtn.textContent = 'Save to History';
            savePostBtn.disabled = false;
        }, 2000);
    });
    
    // Update history display
    function updateHistoryDisplay() {
        if (savedPosts.length > 0) {
            // Clear existing history
            postHistory.innerHTML = '';
            
            // Show history container
            historyContainer.style.display = 'block';
            
            // Add each post to history
            savedPosts.forEach(post => {
                const historyItem = document.createElement('div');
                historyItem.className = 'list-group-item list-group-item-action';
                
                const header = document.createElement('div');
                header.className = 'd-flex justify-content-between';
                
                const title = document.createElement('h6');
                title.className = 'mb-1';
                title.textContent = post.topic;
                
                const timestamp = document.createElement('small');
                timestamp.className = 'text-muted';
                timestamp.textContent = post.timestamp;
                
                header.appendChild(title);
                header.appendChild(timestamp);
                
                const snippet = document.createElement('p');
                snippet.className = 'mb-1 text-truncate';
                snippet.textContent = post.post.substring(0, 100) + '...';
                
                const viewBtn = document.createElement('button');
                viewBtn.className = 'btn btn-sm btn-outline-primary mt-2';
                viewBtn.textContent = 'View Post';
                viewBtn.addEventListener('click', () => viewSavedPost(post));
                
                historyItem.appendChild(header);
                historyItem.appendChild(snippet);
                historyItem.appendChild(viewBtn);
                
                postHistory.appendChild(historyItem);
            });
        } else {
            historyContainer.style.display = 'none';
        }
    }
    
    // View a saved post
    function viewSavedPost(post) {
        postContent.innerHTML = formatContent(post.post);
        
        if (post.comment) {
            commentContent.innerHTML = formatContent(post.comment);
            commentContainer.style.display = 'block';
        } else {
            commentContainer.style.display = 'none';
        }
        
        resultContainer.style.display = 'block';
        window.scrollTo({
            top: resultContainer.offsetTop - 20,
            behavior: 'smooth'
        });
    }
});;