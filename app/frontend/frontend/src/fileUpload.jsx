import React, { useState, useEffect } from 'react';

const FileUpload = () => {
    const [uploadStatus, setUploadStatus] = useState(null);
    const [pollingInterval, setPollingInterval] = useState(null);

    const checkTaskStatus = async (taskId) => {
        try {
            const response = await fetch(`/api/task-status/${taskId}/`);
            const data = await response.json();
            
            setUploadStatus(data);

            // If task is complete or failed, stop polling
            if (data.status === 'SUCCESS' || data.status === 'FAILURE') {
                clearInterval(pollingInterval);
                setPollingInterval(null);
                
                if (data.status === 'SUCCESS') {
                    // Redirect to the CSV viewer or update UI
                    window.location.href = `/csv-viewer/${data.file_id}`;
                }
            }
        } catch (error) {
            console.error('Error checking task status:', error);
            clearInterval(pollingInterval);
            setPollingInterval(null);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/csv/', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            
            if (data.task_id) {
                setUploadStatus({
                    status: 'PENDING',
                    message: 'Processing started...'
                });

                // Start polling with a 2-second interval
                const interval = setInterval(() => checkTaskStatus(data.task_id), 2000);
                setPollingInterval(interval);
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadStatus({
                status: 'ERROR',
                message: 'Upload failed'
            });
        }
    };

    // Cleanup polling on component unmount
    useEffect(() => {
        return () => {
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [pollingInterval]);

    return (
        <div className="file-upload">
            <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload}
            />
            
            {uploadStatus && (
                <div className={`status ${uploadStatus.status.toLowerCase()}`}>
                    <p>{uploadStatus.message}</p>
                    {uploadStatus.progress && (
                        <div className="progress">
                            <p>Processed: {uploadStatus.progress.processed_rows} / {uploadStatus.progress.total_rows}</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FileUpload;