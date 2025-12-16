import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';

interface PortalButton {
  id: string;
  portalId: string;
  text: string;
  url: string;
  order: number;
}

export default function PortalBuilder() {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [buttons, setButtons] = useState<PortalButton[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [welcomeMessage, setWelcomeMessage] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [gifUrl, setGifUrl] = useState('');
  const [enableVerification, setEnableVerification] = useState(true);
  const [challengeType, setChallengeType] = useState('emoji');
  const [challengeDifficulty, setChallengeDifficulty] = useState('medium');
  const [timeLimit, setTimeLimit] = useState(60);
  const [enableTrustLevels, setEnableTrustLevels] = useState(true);

  // New button state
  const [showAddButton, setShowAddButton] = useState(false);
  const [newButtonText, setNewButtonText] = useState('');
  const [newButtonUrl, setNewButtonUrl] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchPortalData();
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const data = await api.getGroups();
      setGroups(data);
      if (data.length > 0) {
        setSelectedGroup(data[0].id);
      }
    } catch (err) {
      toast.error('Failed to fetch groups');
    }
  };

  const fetchPortalData = async () => {
    try {
      setLoading(true);
      const [portalData, buttonsData] = await Promise.all([
        api.getPortal(selectedGroup).catch(() => null),
        api.getPortalButtons(selectedGroup).catch(() => []),
      ]);

      if (portalData) {
        setWelcomeMessage(portalData.welcomeMessage || '');
        setPhotoUrl(portalData.photoUrl || '');
        setVideoUrl(portalData.videoUrl || '');
        setGifUrl(portalData.gifUrl || '');
        setEnableVerification(portalData.enableVerification);
        setChallengeType(portalData.challengeType || 'emoji');
        setChallengeDifficulty(portalData.challengeDifficulty || 'medium');
        setTimeLimit(portalData.timeLimit || 60);
        setEnableTrustLevels(portalData.enableTrustLevels);
      }

      setButtons(buttonsData);
    } catch (err) {
      console.error('Error fetching portal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updatePortal(selectedGroup, {
        welcomeMessage,
        photoUrl: photoUrl || null,
        videoUrl: videoUrl || null,
        gifUrl: gifUrl || null,
        enableVerification,
        challengeType,
        challengeDifficulty,
        timeLimit,
        enableTrustLevels,
      });
      toast.success('Portal configuration saved successfully!');
      fetchPortalData();
    } catch (err) {
      toast.error('Failed to save portal configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleAddButton = async () => {
    if (!newButtonText || !newButtonUrl) {
      toast.error('Please fill in all button fields');
      return;
    }

    try {
      await api.addPortalButton(selectedGroup, {
        text: newButtonText,
        url: newButtonUrl,
        order: buttons.length,
      });
      toast.success('Button added successfully!');
      setNewButtonText('');
      setNewButtonUrl('');
      setShowAddButton(false);
      fetchPortalData();
    } catch (err) {
      toast.error('Failed to add button');
    }
  };

  const handleDeleteButton = async (buttonId: string) => {
    if (!confirm('Are you sure you want to delete this button?')) return;

    try {
      await api.deletePortalButton(buttonId);
      toast.success('Button deleted successfully!');
      fetchPortalData();
    } catch (err) {
      toast.error('Failed to delete button');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading portal configuration...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Portal Builder</h2>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition font-medium"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      {/* Group Selector */}
      {groups.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Group</label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.title}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-6">
          {/* Welcome Message */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Welcome Message</h3>
            <textarea
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              rows={6}
              placeholder="Enter your welcome message..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
            />
            <p className="mt-2 text-sm text-gray-500">
              Supports Markdown formatting. Use **bold**, *italic*, `code`, etc.
            </p>
          </div>

          {/* Media Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Media (Optional)</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Photo URL</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">GIF URL</label>
                <input
                  type="url"
                  value={gifUrl}
                  onChange={(e) => setGifUrl(e.target.value)}
                  placeholder="https://example.com/animation.gif"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <p className="text-sm text-gray-500">Only one media type will be used (priority: Photo &gt; Video &gt; GIF)</p>
            </div>
          </div>

          {/* Verification Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Settings</h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={enableVerification}
                  onChange={(e) => setEnableVerification(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-3 text-sm text-gray-700 font-medium">Enable CAPTCHA Verification</span>
              </label>

              {enableVerification && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Challenge Type</label>
                    <select
                      value={challengeType}
                      onChange={(e) => setChallengeType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="emoji">Emoji Match</option>
                      <option value="math">Math Problem</option>
                      <option value="text">Text Challenge</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                    <select
                      value={challengeDifficulty}
                      onChange={(e) => setChallengeDifficulty(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Limit (seconds)
                    </label>
                    <input
                      type="number"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                      min={10}
                      max={300}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Trust Levels */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={enableTrustLevels}
                  onChange={(e) => setEnableTrustLevels(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-3 text-sm text-gray-700 font-medium">Enable Trust Level System</span>
              </label>
            </div>
          </div>

          {/* Portal Buttons */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Portal Buttons</h3>
              <button
                onClick={() => setShowAddButton(!showAddButton)}
                className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition"
              >
                {showAddButton ? 'Cancel' : '+ Add Button'}
              </button>
            </div>

            {showAddButton && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                <input
                  type="text"
                  value={newButtonText}
                  onChange={(e) => setNewButtonText(e.target.value)}
                  placeholder="Button Text (e.g., Join Community)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="url"
                  value={newButtonUrl}
                  onChange={(e) => setNewButtonUrl(e.target.value)}
                  placeholder="Button URL (e.g., https://t.me/yourchannel)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleAddButton}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium"
                >
                  Add Button
                </button>
              </div>
            )}

            <div className="space-y-2">
              {buttons.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No buttons added yet</p>
              ) : (
                buttons.map((button) => (
                  <div
                    key={button.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{button.text}</div>
                      <div className="text-xs text-gray-500 truncate">{button.url}</div>
                    </div>
                    <button
                      onClick={() => handleDeleteButton(button.id)}
                      className="ml-4 text-red-600 hover:text-red-800"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:sticky lg:top-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Preview</h3>
            <div className="border-2 border-gray-300 rounded-lg p-6 bg-gray-50">
              {/* Media Preview */}
              {(photoUrl || videoUrl || gifUrl) && (
                <div className="mb-4 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center h-48">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Preview" className="max-h-full" onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }} />
                  ) : videoUrl ? (
                    <div className="text-gray-500 text-sm">🎥 Video will appear here</div>
                  ) : gifUrl ? (
                    <img src={gifUrl} alt="GIF Preview" className="max-h-full" onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }} />
                  ) : null}
                </div>
              )}

              {/* Welcome Message Preview */}
              <div className="mb-4">
                {welcomeMessage ? (
                  <div className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                    {welcomeMessage}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic">Your welcome message will appear here...</div>
                )}
              </div>

              {/* Buttons Preview */}
              {buttons.length > 0 && (
                <div className="space-y-2">
                  {buttons.map((button) => (
                    <div
                      key={button.id}
                      className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg text-center text-sm font-medium"
                    >
                      {button.text}
                    </div>
                  ))}
                </div>
              )}

              {/* Verification Preview */}
              {enableVerification && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-xs text-blue-800 font-medium mb-2">Verification Required</div>
                  <div className="text-xs text-blue-600">
                    Challenge: {challengeType} ({challengeDifficulty}) • {timeLimit}s limit
                  </div>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Use emojis to make your message more engaging</li>
                <li>• Keep the welcome message concise and clear</li>
                <li>• Test different CAPTCHA difficulties</li>
                <li>• Add relevant buttons to guide users</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
