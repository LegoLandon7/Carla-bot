# Triggers

---

## Create (trigger) (response) (match_type) (response_type)

### Match Types:

- **Normal:** trigger appears anywhere in message
- **Strict:** trigger is exactly message
- **Exact:** trigger is exactly message including casing and trailing spaces
- **Regex:** uses the regex format for triggers
- **Ends With:** message ends with trigger
- **Starts With:** message starts with trigger
- **Word:** message is self contained with no characters next to it
- **Word Ends With:** word ends with trigger
- **Word Starts With:** word starts with trigger

### Response Types:

- **Normal:** responds normally
- **Custom:** trigger responds using custom variables (see below)
- **Reply:** trigger replies to the message

**Custom Variables:**

{author.mention} – mentions message author
{author.username} – author’s username
{author.nickname} – author’s server nickname
{author.id} – author’s user ID
{author.avatar} – author’s avatar URL
{author.tag} – author’s Discord tag
{message.content} – message text content
{message.length} – message character count
{message.id} – message ID
{channel.name} – channel name
{channel.mention} – mentions the channel
{guild.name} – server name
{guild.memberCount} – server member count
{time.now} – current time timestamp
{time.relative} – relative time timestamp
{date.now} – current date timestamp
{target.mention} – mentions tagged user
{target.username} – tagged user’s username
{trigger} – used trigger word