import { type SchemaTypeDefinition } from 'sanity'

// Documents
import { service } from './documents/service'
import { category } from './documents/category'
import { providerProfile } from './documents/provider-profile'
import { customerProfile } from './documents/customer-profile'
import { jobRequest } from './documents/job-request'
import { booking } from './documents/booking'
import { conversation } from './documents/conversation'
import { message } from './documents/message'
import { review } from './documents/review'
import { agentContext } from './documents/agent-context'

// Objects
import { blockContent } from './objects/block-content'
import { servicePackage } from './objects/service-package'
import { portfolioItem } from './objects/portfolio-item'
import { faq } from './objects/faq'
import { workExperience } from './objects/work-experience'
import { education } from './objects/education'
import { certification } from './objects/certification'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Documents
    service,
    category,
    providerProfile,
    customerProfile,
    jobRequest,
    booking,
    conversation,
    message,
    review,
    agentContext,

    // Objects
    blockContent,
    servicePackage,
    portfolioItem,
    faq,
    workExperience,
    education,
    certification,
  ],
}
