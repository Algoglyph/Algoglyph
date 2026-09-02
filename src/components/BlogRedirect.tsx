import { Navigate, useParams } from 'react-router-dom';
import { ACTIVE_ROADMAP_ZONES as ROADMAP_ZONES } from '../config/activeContent';

export function BlogRedirect() {
  const { slug } = useParams();
  if (!slug) return <Navigate to="/roadmap" replace />;

  for (const zone of ROADMAP_ZONES) {
    for (const topic of zone.topics) {
      for (const concept of topic.concepts) {
        const subtopic = concept.subtopics.find((item) => item.blogSlug === slug);
        if (subtopic) {
          return <Navigate to={`/roadmap/${zone.id}/${topic.id}/${concept.id}/${subtopic.blogSlug}`} replace />;
        }
      }
    }
  }

  return <Navigate to="/roadmap" replace />;
}
